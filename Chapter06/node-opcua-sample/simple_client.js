

var opcua = require("node-opcua");
var async = require("async");

var client = new opcua.OPCUAClient();

var endpointUrl = "opc.tcp://" + require("os").hostname() + ":26543";

var the_session = null;
async.series([


    // step 1 : connect to
    function(callback)  {

        client.connect(endpointUrl,function (err) {

            if(err) {
                console.log(" cannot connect to endpoint :" , endpointUrl );
            } else {
                console.log("connected !");
            }
            callback(err);
        });
    },
    // step 2 : createSession
    function(callback) {
        client.createSession( function(err,session) {
            if(!err) {
                the_session = session;
            }
            callback(err);
        });

    },
    // step 3 : browse
    function(callback) {

        the_session.browse("RootFolder", function(err,browse_result){
            if(!err) {
                browse_result.references.forEach(function(reference) {
                    console.log( reference.browseName);
                });
            }
            callback(err);
        });
    },
    // step 4 : read a variable
    function(callback) {
        the_session.readVariableValue("ns=1;s=Temperature", function(err,dataValue) {
            if (!err) {
                console.log(" temperature = " , dataValue.toString());
            }
            callback(err);
        })
    },

    // step 5: install a subscription and monitored item
    //
    // -----------------------------------------
    // create subscription
    function(callback) {

        the_subscription=new opcua.ClientSubscription(the_session,{
            requestedPublishingInterval: 1000,
            requestedLifetimeCount: 10,
            requestedMaxKeepAliveCount: 2,
            maxNotificationsPerPublish: 10,
            publishingEnabled: true,
            priority: 10
        });
        the_subscription.on("started",function(){
            console.log("subscription started for 2 seconds - subscriptionId=",the_subscription.subscriptionId);
        }).on("keepalive",function(){
            console.log("keepalive");
        }).on("terminated",function(){
            callback();
        });
        setTimeout(function(){
            the_subscription.terminate();
        },10000);


        // install monitored item
        //
        var monitoredItem  = the_subscription.monitor({
            nodeId: opcua.resolveNodeId("ns=1;s=Temperature"),
            attributeId: opcua.AttributeIds.Value 
          //, dataEncoding: { namespaceIndex: 0, name:null }
        },
        { 
            samplingInterval: 100,
            discardOldest: true,
            queueSize: 10 
        });
        console.log("-------------------------------------");

        // subscription.on("item_added",function(monitoredItem){
        //xx monitoredItem.on("initialized",function(){ });
        //xx monitoredItem.on("terminated",function(value){ });
        

        monitoredItem.on("changed",function(value){
           console.log(" New Value = ",value.toString());
        });

    },

    // ------------------------------------------------
    // closing session
    //
    function(callback) {
        console.log(" closing session");
        the_session.close(function(err){

            console.log(" session closed");
            callback();
        });
    },


],
    function(err) {
        if (err) {
            console.log(" failure ",err);
        } else {
            console.log("done!")
        }
        client.disconnect(function(){});
    }) ;

