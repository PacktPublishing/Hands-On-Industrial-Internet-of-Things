"use strict";

const opcua = require("node-opcua");
const os = require("os");


// Let create an instance of OPCUAServer
const server = new opcua.OPCUAServer({
    port: 26543,        // the port of the listening socket of the server
    nodeset_filename: [
        opcua.standard_nodeset_file
    ]
});

// we can set the buildInfo
server.buildInfo.productName = "MySampleServer1";
server.buildInfo.buildNumber = "7658";
server.buildInfo.buildDate = new Date(2015, 12, 25);


function construct_my_address_space(server) {

    const addressSpace = server.engine.addressSpace;
    const namespace = addressSpace.getOwnNamespace();

    // we create a new folder under RootFolder
    const myDevice = namespace.addFolder("ObjectsFolder", {
        browseName: "MyDevice"
    });

    // now let's add first variable in folder
    // the addVariableInFolder
    const variable1 = 10.0;


    server.nodeVariable1 = namespace.addVariable({
        componentOf: myDevice,
        nodeId: "s=Temperature",
        browseName: "Temperature",
        dataType: "Double",
        value: {
            get: () => {
                const t = new Date() / 10000.0;
                const value = variable1 + 10.0 * Math.sin(t);
                return new opcua.Variant({dataType: opcua.DataType.Double, value: value});
            }
        }
    });


    let variable2 = 10.0;

    server.nodeVariable2 = namespace.addVariable({
        componentOf: myDevice,
        browseName: "MyVariable2",
        dataType: "Double",
        value: {
            get: () => new opcua.Variant({dataType: opcua.DataType.Double, value: variable2}),
            set: (variant) => {
                variable2 = parseFloat(variant.value);
                return opcua.StatusCodes.Good;
            }
        }
    });


    server.nodeVariable3 = namespace.addVariable({
        componentOf: myDevice,
        nodeId: "b=1020ffab", // some opaque NodeId in namespace 4
        browseName: "Percentage Memory Used",
        dataType: "Double",
        minimumSamplingInterval: 1000,
        value: {
            get: () => {
                // const value = process.memoryUsage().heapUsed / 1000000;
                const percentageMemUsed = 1.0 - (os.freemem() / os.totalmem());
                const value = percentageMemUsed * 100;
                return new opcua.Variant({dataType: opcua.DataType.Double, value: value});
            }
        }
    });

}

// the server needs to be initialized first. During initialisation,
// the server will construct its default namespace.
server.initialize(function () {

    console.log("initialized");

    // we can now extend the default name space with our variables
    construct_my_address_space(server);

    // we can now start the server
    server.start(function () {
        console.log("Server is now listening ... ( press CTRL+C to stop) ");
        server.endpoints[0].endpointDescriptions().forEach(function (endpoint) {
            console.log(endpoint.endpointUrl, endpoint.securityMode.toString(), endpoint.securityPolicyUri.toString());
        });
    });

});

