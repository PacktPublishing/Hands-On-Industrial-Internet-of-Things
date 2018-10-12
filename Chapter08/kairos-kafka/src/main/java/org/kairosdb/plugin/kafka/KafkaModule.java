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


import java.util.Properties;

import org.apache.kafka.clients.consumer.Consumer;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.serialization.ByteArrayDeserializer;
import org.kairosdb.plugin.kafka.iiotbook.parser.MQTTJsonTopicParserImpl;
import org.kairosdb.plugin.kafka.parser.StringTopicParserImpl;

import com.google.inject.AbstractModule;
import com.google.inject.Provides;
import com.google.inject.Singleton;
import com.google.inject.name.Named;

public class KafkaModule extends AbstractModule
{
	@Override
	protected void configure()
	{
		bind(KafkaService.class).in(Singleton.class);
		bind(TopicParserFactory.class).to(GuiceTopicParserFactory.class).in(Singleton.class);

		//Bind your topic parser into guice.
		bind(StringTopicParserImpl.class);
		bind(MQTTJsonTopicParserImpl.class);
	}

	@Provides
	private Consumer<byte[], byte[]> provideConsumerConnector(
			@Named("kairosdb.kafka.bootstrap.servers") String bootsrapserver,
			@Named("kairosdb.kafka.group.id") String groupid, 
			TopicParserFactory factory)
	{

		
		Properties props = new Properties();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootsrapserver); ///TBD
        props.put(ConsumerConfig.CLIENT_ID_CONFIG, "kafka-mqtt");
        props.put(ConsumerConfig.GROUP_ID_CONFIG, groupid);
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, ByteArrayDeserializer.class);
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, ByteArrayDeserializer.class);
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        
        
	      // Create the consumer using props.
	      final Consumer<byte[], byte[]> consumer =
	                                  new KafkaConsumer<>(props);

	      // Subscribe to the topic.
	      
	      consumer.subscribe(factory.getTopics());
	      
	      System.out.println("Consumer Started " + consumer + " subscribed to " + factory.getTopics());
		return consumer;
	}

}
