package org.iiotbook.util;

import com.google.gson.JsonElement;
import com.google.gson.JsonParser;

public class MQTTUtil {
	public static String getPayload(byte[] data) {
		
		JsonParser parser = new JsonParser();
		
		JsonElement el = parser.parse(new String(data));
		return el.getAsJsonObject().get("payload").getAsString();
	}
}
