package org.kairosdb.plugin.kafka;


import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.streams.kstream.KStream;
import org.kairosdb.core.DataPoint;
import org.kairosdb.core.DataPointSet;
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

	private final TopicParserFactory topicParserFactory;
	private final ConsumerRecords<byte[], byte[]> stream;
	private final int threadNumber;
	private final Publisher<DataPointEvent> publisher;

	public ConsumerThread(Publisher<DataPointEvent> publisher, TopicParserFactory topicParserFactory, ConsumerRecords<byte[], byte[]> stream, int threadNumber)
	{
		this.publisher = publisher;
		this.topicParserFactory = topicParserFactory;
		this.stream = stream;
		this.threadNumber = threadNumber;
	}


	@Override
	public void run()
	{
		Thread.currentThread().setName("TH " + this.threadNumber);
		logger.info("starting consumer thread " + this.threadNumber);
		
		stream.forEach(record -> {
			
			/// REMOVE ME
            System.out.printf("Consumer Record:(%s, %s, %s, %s\n",
                    record.key(), record.value(),
                    record.partition(), record.offset());
            
            /// REMOVE ME
            
            String topic = record.topic();
            System.out.println(topic);
            TopicParser parser;
			try {
				parser = topicParserFactory.getTopicParser(topic);
			} catch (Exception e) {
				e.printStackTrace();
				throw e;
			}
            System.out.println(parser);
            
			DataPointSet set = parser.parseTopic(topic, record.key(), record.value());

			for (DataPoint dataPoint : set.getDataPoints())
			{
				DataPointEvent dte = new DataPointEvent(set.getName(), set.getTags(), dataPoint);
				logger.info("DataPointEvent : " + dte);
				publisher.post(dte);
			}
			


        });
		
	}
}
