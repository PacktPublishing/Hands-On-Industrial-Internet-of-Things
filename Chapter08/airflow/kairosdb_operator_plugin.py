
from airflow.plugins_manager import AirflowPlugin
from airflow.hooks import HttpHook
from airflow.models import BaseOperator
from airflow.operators import BashOperator
from airflow.utils import apply_defaults
import logging
import textwrap
import time
import json
import datetime
import logging


class KairosDBOperator(BaseOperator):
    """
   Operator to facilitate interacting with the kairosDB which executes Apache Spark code via a REST API.
   :param query: Scala, the kairos query
   :type spark_script: string

   """


    @apply_defaults
    def __init__(
            self,
            query,
            http_conn_id='http_kairosdb',
            *args, **kwargs):
        super(KairosDBOperator,self).__init__(*args,**kwargs)
        self.query=query
        self.http_conn_id = http_conn_id
        self.acceptable_response_codes = [200, 201]
        self.http = HttpHook("GET", http_conn_id=self.http_conn_id)

    def execute(self, context):
        # Simple test
        headers={'Content-Type':'application/json'}

        response = self._http_rest_call("POST", "/api/v1/datapoints/query", data=json.dumps(self.query), headers=headers)
        logging.debug("Status code: %d" % response.status_code)
        if not(response.status_code in self.acceptable_response_codes):
            return None
        r=response.json()
        logging.debug("JSON response: %s" % r)
        
        if r:
            return r.get("queries")
        else :
            return None 

    def _http_rest_call(self, method, endpoint, data=None, headers=None, extra_options=None):
        if not extra_options:
            extra_options = {}
        logging.info("Performing HTTP REST call... (method: " + str(method) + ", endpoint: " + str(endpoint) + ", data: " + str(data) + ", headers: " + str(headers) + ")")
        self.http.method = method

        response = self.http.run(endpoint, data, headers, extra_options=extra_options)

        logging.debug("status_code: " + str(response.status_code))
        logging.debug("response_as_json: " + str(response.json()))

        return response

# Defining the plugin class
class KairosDBOperatorPlugin(AirflowPlugin):
    name = "kairosdb_operator_plugin"
    operators = [KairosDBOperator]
    flask_blueprints = []
    hooks = []
    executors = []
    admin_views = []
    menu_links = []