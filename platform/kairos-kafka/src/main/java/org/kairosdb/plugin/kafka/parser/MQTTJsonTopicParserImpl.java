package org.kairosdb.plugin.kafka.parser;

import java.nio.charset.Charset;
import java.util.Base64;
import java.util.Properties;

import org.kairosdb.core.DataPointSet;
import org.kairosdb.core.datapoints.DoubleDataPoint;
import org.kairosdb.core.datapoints.StringDataPoint;
import org.kairosdb.plugin.kafka.TopicParser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.gson.JsonElement;
import com.google.gson.JsonParser;
import com.google.inject.Inject;


public class MQTTJsonTopicParserImpl implements TopicParser
{
	
	public static final Logger logger = LoggerFactory.getLogger(MQTTJsonTopicParserImpl.class);

	private static final Charset UTF8 = Charset.forName("UTF-8");

	private String propertyName;
	private Properties properties;
	private String metricName;

	@Inject
	public MQTTJsonTopicParserImpl(Properties properties)
	{
		this.properties = properties;
	}

	@Override
	public DataPointSet parseTopic(String topic, byte[] key, byte[] value)
	{	
		try {
			return buildDataPointSet(getPayload(key), getPayload(value),topic);
		} catch (Exception e) {
			e.printStackTrace();
			throw e;
		}
	}
	
	
	private DataPointSet buildDataPointSet(String key, String value, String topic) {
		System.out.println(key + " " + value + " " + topic);
		try {
			value = new String(Base64.getDecoder().decode(value));
		} catch (Exception e) {
			System.err.println("it is not base 64 encoded");
		}
		
		String[] values = value.split(",");
		
		long ts = System.currentTimeMillis();
		String metricname=topic;
		String quality="GOOD";
		if (values.length>3) {
			metricname = values[0];
			ts =Long.parseLong(values[1]);
			value=values[2];
			quality=values[3];
		} else if (values.length>2) {
			metricname = values[0];
			value=values[1];
			quality=values[2];
			
		} else if (values.length>1) {
			metricname = values[0];
			value=values[1];
		} else {
			value=values[0];
		}
		
		logger.info(String.format("DataPoint (%s) => %s: %s, %s, %s" , topic, metricname , ts , value , quality));
		DataPointSet set = new DataPointSet(metricname);
		try {
			set.addDataPoint(new DoubleDataPoint(ts,Double.parseDouble(value)));
		} catch (NumberFormatException e) {
			set.addDataPoint(new StringDataPoint(ts,value));
		}
		
		set.addTag("source", topic);
		set.addTag("quality", quality);
		return set;
	}
	
	private String getPayload(byte[] data) {
		
		JsonParser parser = new JsonParser();
		
		JsonElement el = parser.parse(new String(data));
		return el.getAsJsonObject().get("payload").getAsString();
	}

	@Override
	public void setPropertyName(String name)
	{
		propertyName = name;
	}
}
