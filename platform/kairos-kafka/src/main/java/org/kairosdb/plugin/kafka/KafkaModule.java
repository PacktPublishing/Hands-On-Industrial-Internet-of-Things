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


import com.google.inject.AbstractModule;
import com.google.inject.Provides;
import com.google.inject.Singleton;
import com.google.inject.name.Named;
import kafka.consumer.Consumer;
import kafka.consumer.ConsumerConfig;
import kafka.javaapi.consumer.ConsumerConnector;

import java.util.Properties;

public class KafkaModule extends AbstractModule
{
	@Override
	protected void configure()
	{
		bind(KafkaService.class).in(Singleton.class);
		bind(TopicParserFactory.class).to(GuiceTopicParserFactory.class).in(Singleton.class);

		//Bind your topic parser into guice.
		bind(StringTopicParser.class);
	}

	@Provides
	private ConsumerConnector provideConsumerConnector(@Named("kairosdb.kafka.zookeeper.connect") String zookeeper,
			@Named("kairosdb.kafka.group.id") String groupid)
	{
		return Consumer.createJavaConsumerConnector(createConsumerConfig(zookeeper, groupid));
	}


	private static ConsumerConfig createConsumerConfig(String zookeeper, String groupId)
	{
		Properties props = new Properties();
		props.put("zookeeper.connect", zookeeper);
		props.put("group.id", groupId);
		props.put("zookeeper.session.timeout.ms", "400");
		props.put("zookeeper.sync.time.ms", "200");
		props.put("auto.commit.interval.ms", "1000");

		return new ConsumerConfig(props);
	}
}
