package org.apache.kafka.streams.iiotbook.mqtt.temperature;

import java.util.Base64;
import java.util.Map;

import org.apache.kafka.common.serialization.Deserializer;
import org.apache.kafka.common.serialization.Serializer;
import org.iiotbook.util.MQTTUtil;

public class ValueMQTTSerializer implements org.apache.kafka.common.serialization.Serde<String> {

	@Override
	public void close() {}

	@Override
	public void configure(Map<String, ?> arg0, boolean arg1) {}

	@Override
	public Deserializer<String> deserializer() {
		return new Deserializer<String>() {
			
			@Override
			public String deserialize(String arg0, byte[] arg1) {
				//System.out.println("DES: " +new String(arg1));
				String value=new String(arg1);
				try {
					value = MQTTUtil.getPayload(arg1);
					value = new String(Base64.getDecoder().decode(value));
				} catch (Exception e) {
					System.err.println("DES: " +new String(arg1));
				}
		        return value;
			}
			
			@Override
			public void close() {}

			@Override
			public void configure(Map<String, ?> arg0, boolean arg1) {}
			
		};
	}

	@Override
	public Serializer<String> serializer() {
		
		return new Serializer<String>() {

			@Override
			public byte[] serialize(String arg0, String arg1) {
				//System.out.println("SER: " + new String(arg1));
				return (String.format("{\"payload\":\"%s\"}", Base64.getEncoder().encodeToString(arg1.getBytes()))).getBytes();
			}

			@Override
			public void close() {}

			@Override
			public void configure(Map<String, ?> arg0, boolean arg1) {}
			
		};
	}

	


}
