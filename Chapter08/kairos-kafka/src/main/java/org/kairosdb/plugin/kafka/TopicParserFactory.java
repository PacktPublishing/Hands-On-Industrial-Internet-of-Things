package org.kairosdb.plugin.kafka;

import java.util.Set;

/**
 Created by bhawkins on 2/18/14.
 */
public interface TopicParserFactory
{
	public TopicParser getTopicParser(String topic);
	public Set<String> getTopics();
}
