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

import static com.google.common.base.Preconditions.checkNotNull;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import javax.inject.Inject;

import org.apache.kafka.clients.consumer.Consumer;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.kairosdb.core.KairosDBService;
import org.kairosdb.core.exception.KairosDBException;
import org.kairosdb.eventbus.FilterEventBus;
import org.kairosdb.eventbus.Publisher;
import org.kairosdb.events.DataPointEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.inject.name.Named;


public class KafkaService implements KairosDBService
{
	public static final Logger logger = LoggerFactory.getLogger(org.kairosdb.plugin.kafka.KafkaService.class);

	private final TopicParserFactory topicParserFactory;

	private final Consumer<byte[], byte[]> consumer;
	private final Publisher<DataPointEvent> publisher;
	private ExecutorService executor;
	private boolean run=true;


	@Inject
	public KafkaService(@Named("kairosdb.kafka.consumer_threads") int threads,
			FilterEventBus eventBus,
			TopicParserFactory topicParserFactory,
			Consumer<byte[], byte[]> consumer)
	{
		this.topicParserFactory = topicParserFactory;
		this.publisher = checkNotNull(eventBus).createPublisher(DataPointEvent.class);
		this.consumer = consumer;
		this.executor = Executors.newFixedThreadPool(threads);
	}


	@Override
	public void start() throws KairosDBException
	{
		
		while (run) {
            final ConsumerRecords<byte[], byte[]> consumerRecords =
                    consumer.poll(1);
            
            if (consumerRecords.count()==0) {
            	try {
					TimeUnit.MILLISECONDS.sleep(10);
				} catch (InterruptedException e) {
					logger.error(" MAIN " , e);
				}
            	continue;
            }
            
            int threadNumber = 0;
			executor.submit(new ConsumerThread(publisher, topicParserFactory, consumerRecords, threadNumber));
			threadNumber++;
            consumer.commitAsync();
        }
	}

	@Override
	public void stop()
	{
		run = false;
		System.out.println("KafkaService.stop");
		if (consumer != null) consumer.close();
		if (executor != null) executor.shutdown();
	}


}
