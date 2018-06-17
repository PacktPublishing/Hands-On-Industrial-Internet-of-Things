package org.kairosdb.plugin.kafka;

import com.google.common.base.Splitter;
import com.google.inject.Inject;
import com.google.inject.Injector;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 Created by bhawkins on 2/18/14.
 */
public class GuiceTopicParserFactory implements TopicParserFactory
{
	private Pattern m_classPattern = Pattern.compile("kairosdb\\.kafka\\.topicparser\\.(.*)\\.class");
	private Pattern m_topicsPattern = Pattern.compile("kairosdb\\.kafka\\.topicparser\\.(.*)\\.topics");
	private Injector m_injector;
	Map<String, TPDefinition> m_definitionMap = new HashMap<String, TPDefinition>();

	/**
	 Map of topic name to class name
	 */
	Map<String, TPDefinition> m_topicMap = new HashMap<String, TPDefinition>();

	private TPDefinition getDefinition(String name)
	{
		TPDefinition def = m_definitionMap.get(name);
		if (def == null)
		{
			def = new TPDefinition();
			def.setPropertyName(name);
			m_definitionMap.put(name, def);
		}

		return def;
	}

	@Inject
	public GuiceTopicParserFactory(Injector injector, Properties properties)
	{
		m_injector = injector;

		for (String name : properties.stringPropertyNames())
		{
			Matcher topicsMatcher = m_topicsPattern.matcher(name);
			if (topicsMatcher.matches())
			{
				String propName = topicsMatcher.group(1);
				TPDefinition def = getDefinition(propName);

				for (String topic : Splitter.on(",").split(properties.getProperty(name)))
				{
					def.addTopics(topic);
				}

				continue;
			}

			Matcher classMatcher = m_classPattern.matcher(name);
			if (classMatcher.matches())
			{
				String propName = classMatcher.group(1);
				TPDefinition def = getDefinition(propName);

				def.setClassName(properties.getProperty(name));
			}
		}

		//Put the class names into a map we can lookup by topic
		for (TPDefinition definition : m_definitionMap.values())
		{
			for (String topic : definition.getTopics())
			{
				m_topicMap.put(topic, definition);
			}
		}
	}

	public TopicParser getTopicParser(String topic)
	{
		TPDefinition def = m_topicMap.get(topic);
		String className = def.getClassName();

		Class<TopicParser> aClass = null;
		try
		{
			aClass = (Class<TopicParser>) Class.forName(className);
		}
		catch (ClassNotFoundException e)
		{
			e.printStackTrace();
		}

		TopicParser tp = m_injector.getInstance(aClass);
		tp.setPropertyName(def.getPropertyName());

		return tp;
	}

	@Override
	public Set<String> getTopics()
	{
		return m_topicMap.keySet();
	}


	private static class TPDefinition
	{
		private List<String> m_topics;
		private String m_className;
		private String m_propertyName;

		public TPDefinition()
		{
			m_topics = new ArrayList<String>();
		}

		public void setPropertyName(String propertyName)
		{
			m_propertyName = propertyName;
		}

		public String getPropertyName()
		{
			return m_propertyName;
		}

		public void addTopics(String topic)
		{
			m_topics.add(topic);
		}

		public void setClassName(String className)
		{
			m_className = className;
		}

		public List<String> getTopics()
		{
			return m_topics;
		}

		public String getClassName()
		{
			return m_className;
		}
	}
}
