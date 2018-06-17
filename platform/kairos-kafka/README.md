
based on https://github.com/kairosdb/kairos-kafka and here forked for reference

kairos-kafka
============

Kafka plugin for KairosDB

Currently built against a staging repo for the upcoming KairosDB 0.9.4

Using the Kafka Plugin
----------------------

Because kafka events are just binary blobs this plugin cannot handle all use
cases.  You will need to write your own topic parser but, never fear I think
I've made the process pretty simple.

Do the following:

1. Fork the plugin repo
2. Implement your own TopicParser class.
3. Bind your class in KafkaModule.java
4. Declare your parser in kairos-kafka.properties.

I've implemented a StringTopicParser that assumes each kafka event is a UTF8 string.
Use StringTopicParser as an example of how to implement your own topic parser.


Information about Kairos plugins
--------------------------------

For information on how Kairos plugins work see the [project wiki page](https://code.google.com/p/kairosdb/wiki/Plugins)


Todo Items:
-----------
* Add pre and post install scripts to stop and restart Kairos.
* More unit tests.
