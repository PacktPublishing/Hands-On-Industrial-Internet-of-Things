package org.kairosdb.plugin.kafka;

import org.kairosdb.core.DataPointSet;

/**
 Created by bhawkins on 2/18/14.
 */
public interface TopicParser
{
	public DataPointSet parseTopic(String topic, byte[] key, byte[] value);
	public void setPropertyName(String name);
}
