package org.kairosdb.plugin.kafka;

import kafka.consumer.KafkaStream;
import kafka.message.MessageAndMetadata;
import org.kairosdb.core.DataPoint;
import org.kairosdb.core.DataPointSet;
import org.kairosdb.core.datastore.Datastore;
import org.kairosdb.core.exception.DatastoreException;
import org.kairosdb.eventbus.Publisher;
import org.kairosdb.events.DataPointEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 Created by bhawkins on 2/17/14.
 */
public class ConsumerThread implements Runnable
{
	public static final Logger logger = LoggerFactory.getLogger(ConsumerThread.class);

	private final String m_topic;
	private final KafkaStream<byte[], byte[]> m_stream;
	private final int m_threadNumber;
	private final Publisher<DataPointEvent> m_publisher;
	private TopicParser m_topicParser;

	public ConsumerThread(Publisher<DataPointEvent> publisher, String topic, KafkaStream<byte[], byte[]> stream, int threadNumber)
	{
		m_publisher = publisher;
		m_topic = topic;
		m_stream = stream;
		m_threadNumber = threadNumber;
	}

	public void setTopicParser(TopicParser parser)
	{
		m_topicParser = parser;
	}

	@Override
	public void run()
	{
		Thread.currentThread().setName(this.m_topic + "-" + this.m_threadNumber);
		logger.info("starting consumer thread " + this.m_topic + "-" + this.m_threadNumber);
		for (MessageAndMetadata<byte[], byte[]> messageAndMetadata : m_stream)
		{
			try
			{
				logger.debug("message: " + messageAndMetadata.message());
				DataPointSet set = m_topicParser.parseTopic(m_topic, messageAndMetadata.key(),
						messageAndMetadata.message());

				for (DataPoint dataPoint : set.getDataPoints())
				{
					m_publisher.post(new DataPointEvent(set.getName(), set.getTags(), dataPoint));
				}

				//m_counter.incrementAndGet();
			}
			catch (Exception e)
			{
				logger.error("Failed to store message: " + messageAndMetadata.message(), e.getMessage());
			}
		}
	}
}
