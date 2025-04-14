const roletas = [
    {
        id: "rcuid01"
    },
    {
        id: "rcuid02"
    }
]
const settings = {
    mqttBaseTopic: "/basetopic"
}

var client;

window.addEventListener("DOMContentLoaded", () => {
    // MQTT information and details
    const clientId = "web-ui_" + Math.random().toString(16).substring(2, 8);
    // port 8443 is used because cloudflare support only some ports in proxy domain
    const host = "wss://broker.example.com:8443/mqtt";
    const options = {
        keepalive: 60,
        clientId: clientId,
        protocolId: 'MQTT',
        protocolVersion: 4,
        clean: true,
        reconnectPeriod: 1000,
        connectTimeout: 30 * 1000,
        path: "/mqtt",
        username: "user",
        password: "pass",
        will: {
            topic: 'WillMsg',
            payload: 'Connection Closed abnormally..!',
            qos: 0,
            retain: false
        },
    }

    client = mqtt.connect(host, options);

    client.on('error', (err) => {
        console.log('Connection error: ', err);
        console.log("Conntection stack", err.stack);
        client.end();
    });

    client.on('reconnect', () => {
        console.log('Reconnecting...');
    });

        client.on("connect", () => {
        // client.publish("/test/roleta", "hello world!")
        client.subscribe("/basetopic/");
        
    });

});

function commandRoleta(button) {
    var command = button.getAttribute("etiamsi-command");
    var rcuid = button.getAttribute("etiamsi-rcuid");
    var topicString = settings.mqttBaseTopic + "/" + rcuid;

    client.publish(topicString, command);
}

function setLightIntensity(slider) {
    var valueDecimal = Number(slider.value);
    var valueHex = valueDecimal.toString(16);
    valueHex = ('00' + valueHex).slice(-2);
    var animationDurationMS = 0;
    var animationDurationMSHex = ('0000' + animationDurationMS.toString(16)).slice(-4);
    var rgbwWithDuration = valueHex.repeat(4) + animationDurationMSHex;
    var topicString = settings.mqttBaseTopic + "/rgbw";
    
    client.publish(topicString, rgbwWithDuration);
}