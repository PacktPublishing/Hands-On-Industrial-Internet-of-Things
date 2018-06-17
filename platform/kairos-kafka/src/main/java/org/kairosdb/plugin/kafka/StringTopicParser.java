package org.kairosdb.plugin.kafka;

import com.google.inject.Inject;
import org.kairosdb.core.DataPointSet;
import org.kairosdb.core.datapoints.StringDataPoint;
import org.kairosdb.core.datapoints.StringDataPointFactory;

import java.nio.charset.Charset;
import java.util.Properties;

/**
 Created by bhawkins on 2/18/14.
 */
public class StringTopicParser implements TopicParser
{
	private static final Charset UTF8 = Charset.forName("UTF-8");

	private String m_propertyName;
	private Properties m_properties;
	private String m_metricName;

	@Inject
	public StringTopicParser(Properties properties)
	{
		m_properties = properties;
	}

	@Override
	public DataPointSet parseTopic(String topic, byte[] key, byte[] value)
	{
		DataPointSet set = new DataPointSet(m_metricName);
		set.addTag("topic", topic);
		set.addDataPoint(new StringDataPoint(System.currentTimeMillis(), new String(value, UTF8)));

		return set;
	}

	@Override
	public void setPropertyName(String name)
	{
		m_propertyName = name;

		m_metricName = m_properties.getProperty("kairosdb.kafka.topicparser."+name+".metric");
	}
}
