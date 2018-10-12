package org.apache.kafka.streams.iiotbook.mqtt.temperature;

import java.util.Map;
import java.util.Properties;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

import org.apache.commons.collections4.map.HashedMap;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.serialization.Serde;
import org.apache.kafka.common.serialization.Serdes;
import org.apache.kafka.streams.KafkaStreams;
import org.apache.kafka.streams.StreamsBuilder;
import org.apache.kafka.streams.StreamsConfig;
import org.apache.kafka.streams.kstream.KStream;
import org.apache.kafka.streams.kstream.KeyValueMapper;
import org.apache.kafka.streams.kstream.Predicate;
import org.apache.kafka.streams.kstream.Produced;
import org.apache.kafka.streams.kstream.Reducer;
import org.apache.kafka.streams.kstream.TimeWindows;
import org.apache.kafka.streams.kstream.Windowed;
import org.apache.kafka.streams.kstream.internals.WindowedDeserializer;
import org.apache.kafka.streams.kstream.internals.WindowedSerializer;

class RuleEngineDemo {

    // window size within which the filtering is applied
    private static final int WINDOW_SIZE = 5;
    
    public static String getKey(String key, String value) {

       String[] values= value.split(",");
       
       if (values.length>1) {
			return values[0];
		} else {
			return value;
		}
    }
    
    public static Double getValue(String value) {

        String[] values= value.split(",");
        
        if (values.length>3) {
 			return Double.parseDouble(values[2]);
        } else if (values.length>1) {
 			return Double.parseDouble(values[1]);
        } else {
 			return Double.parseDouble(value);
 		}
     }

    public static void main(String[] args) throws Exception {
    	
    	//transform the real measure to a standard measure
    	Map<String,String> tagMapping = new HashedMap<>();
    	tagMapping.put("device0.my.measure.temperature", "temperature");
    	
    	//rules definition
    	Map<String,Double> excursion = new HashedMap<>();
    	excursion.put("temperature", 25.0);

        Properties props = new Properties();
        props.put(StreamsConfig.APPLICATION_ID_CONFIG, "streams-measures");
        props.put(StreamsConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
        props.put(StreamsConfig.DEFAULT_KEY_SERDE_CLASS_CONFIG, Serdes.String().getClass());
        props.put(StreamsConfig.DEFAULT_VALUE_SERDE_CLASS_CONFIG, ValueMQTTSerializer.class);

        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        props.put(StreamsConfig.CACHE_MAX_BYTES_BUFFERING_CONFIG, 0);

        StreamsBuilder builder = new StreamsBuilder();

        KStream<String, String> source = builder.stream("mqtt");

        KStream<Windowed<String>, String> max = source
            .selectKey(new KeyValueMapper<String, String, String>() {
                @Override
                public String apply(String key, String value) {
                    return getKey(key, value);
                }
            })
            .groupByKey()
            .windowedBy(TimeWindows.of(TimeUnit.SECONDS.toMillis(WINDOW_SIZE)))
            .reduce(new Reducer<String>() {
                @Override
                public String apply(String value1, String value2) {
                	double v1=getValue(value1);
                	double v2=getValue(value2);
                    if ( v1 > v2)
                        return value1;
                    else
                        return value2;
                }
            })
            .toStream()
            .filter(new Predicate<Windowed<String>, String>() {
                @Override
                public boolean test(Windowed<String> key, String value) {
                	String measure = tagMapping.get(key.key());
                	if (measure!=null) {
                		
                		Double threshold = excursion.get(measure);
                		if (threshold!=null) {
                			System.out.println(String.format("%s : %s > %s", key.key(), value, threshold));
                			return getValue(value) > threshold;
                		}
                	} else {
                		System.out.println("UNKNOWN MEASURE! Did you mapped? : " + key.key());
                	}
                	return false;
                }
            });

        WindowedSerializer<String> windowedSerializer = new WindowedSerializer<>(Serdes.String().serializer());
        WindowedDeserializer<String> windowedDeserializer = new WindowedDeserializer<>(Serdes.String().deserializer(), WINDOW_SIZE);
        Serde<Windowed<String>> windowedSerde = Serdes.serdeFrom(windowedSerializer, windowedDeserializer);

        // the output
        max.to("excursion", Produced.with(windowedSerde, Serdes.String()));

        final KafkaStreams streams = new KafkaStreams(builder.build(), props);
        final CountDownLatch latch = new CountDownLatch(1);

        // attach shutdown handler to catch control-c
        Runtime.getRuntime().addShutdownHook(new Thread("streams-temperature-shutdown-hook") {
            @Override
            public void run() {
                streams.close();
                latch.countDown();
            }
        });

        try {
            streams.start();
            latch.await();
        } catch (Throwable e) {
            System.exit(1);
        }
        System.exit(0);
    }
}