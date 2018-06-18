package org.kairosdb.plugin.kafka.parser;

import java.nio.charset.Charset;
import java.util.Properties;

import org.kairosdb.core.DataPointSet;
import org.kairosdb.core.datapoints.StringDataPoint;
import org.kairosdb.plugin.kafka.TopicParser;

import com.google.inject.Inject;

/**
 Created by bhawkins on 2/18/14.
 */
public class StringTopicParserImpl implements TopicParser
{
	private static final Charset UTF8 = Charset.forName("UTF-8");

	private String m_propertyName;
	private Properties m_properties;
	private String m_metricName;

	@Inject
	public StringTopicParserImpl(Properties properties)
	{
		m_properties = properties;
	}

	@Override
	public DataPointSet parseTopic(String topic, byte[] key, byte[] value)
	{	
		return buildDataPointSet(m_metricName, System.currentTimeMillis(), new String(value), topic, "UNKNOWN");
	}
	
	protected DataPointSet buildDataPointSet(String metricName, long ts, String value, String source, String quality) {
		DataPointSet set = new DataPointSet(metricName);
		
		set.addDataPoint(new StringDataPoint(ts,value));
		set.addTag("source", source);
		set.addTag("quality", quality);
		return set;
	}

	@Override
	public void setPropertyName(String name)
	{
		m_propertyName = name;

		m_metricName = m_properties.getProperty("kairosdb.kafka.topicparser."+name+".metric");
	}
}
