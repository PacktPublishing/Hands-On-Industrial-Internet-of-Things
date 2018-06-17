/*
 * Copyright 2013 Proofpoint Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.kairosdb.plugin.kafka;

import com.google.common.collect.ImmutableMap;
import com.google.inject.name.Named;
import kafka.javaapi.consumer.ConsumerConnector;
import kafka.consumer.KafkaStream;
import org.kairosdb.core.KairosDBService;
import org.kairosdb.core.datastore.Datastore;
import org.kairosdb.core.exception.KairosDBException;
import org.kairosdb.eventbus.FilterEventBus;
import org.kairosdb.eventbus.Publisher;
import org.kairosdb.events.DataPointEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import scala.collection.JavaConversions;

import javax.inject.Inject;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import static com.google.common.base.Preconditions.checkNotNull;

public class KafkaService implements KairosDBService
{
	public static final Logger logger = LoggerFactory.getLogger(org.kairosdb.plugin.kafka.KafkaService.class);

	private final Map<String, Integer> m_topicCountMap;
	private final TopicParserFactory m_topicParserFactory;
	private final int m_threadsPerTopic;
	private final ConsumerConnector m_consumer;
	private final Publisher<DataPointEvent> m_publisher;
	private ExecutorService m_executor;


	@Inject
	public KafkaService(@Named("kairosdb.kafka.consumer_threads") int threads,
			FilterEventBus eventBus,
			TopicParserFactory topicParserFactory,
			ConsumerConnector consumer)
	{
		m_topicParserFactory = topicParserFactory;
		m_publisher = checkNotNull(eventBus).createPublisher(DataPointEvent.class);
		m_consumer = consumer;
		ImmutableMap.Builder<String, Integer> topicThreadMapBuilder = ImmutableMap.builder();

		for (String topic : topicParserFactory.getTopics())
		{
			topicThreadMapBuilder.put(topic, threads);
		}

		m_threadsPerTopic = threads;

		m_topicCountMap = topicThreadMapBuilder.build();
	}


	@Override
	public void start() throws KairosDBException
	{
		Map<String, List<KafkaStream<byte[], byte[]>>> consumerMap =
				m_consumer.createMessageStreams(m_topicCountMap);

		for (String topic : consumerMap.keySet())
		{
			logger.info("Starting consumer for topic " + topic);
			List<KafkaStream<byte[], byte[]>> streams = consumerMap.get(topic);

			m_executor = Executors.newFixedThreadPool(m_threadsPerTopic * consumerMap.keySet().size());

			int threadNumber = 0;
			for (final KafkaStream<byte[], byte[]> stream : streams)
			{
				ConsumerThread ct = new ConsumerThread(m_publisher, topic, stream, threadNumber);
				ct.setTopicParser(m_topicParserFactory.getTopicParser(topic));

				m_executor.submit(ct);
				threadNumber++;
			}
		}
	}

	@Override
	public void stop()
	{
		if (m_consumer != null) m_consumer.shutdown();
		if (m_executor != null) m_executor.shutdown();
	}


}
