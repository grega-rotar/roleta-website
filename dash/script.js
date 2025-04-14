
var client;
window.addEventListener("DOMContentLoaded", () => {
    // MQTT information and details
    const clientId = "web-ui_" + Math.random().toString(16).substring(2, 8);
    // port 8443 is used because cloudflare support only some ports in proxy domain
    const host = "wss://bikepower.etiam.si:8443/mqtt";
    const options = {
        keepalive: 60,
        clientId: clientId,
        protocolId: 'MQTT',
        protocolVersion: 4,
        clean: true,
        reconnectPeriod: 1000,
        connectTimeout: 30 * 1000,
        path: "/mqtt", // NUJNO
        username: "web-ui",
        password: "web-ui",
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
        client.end();
    });

    client.on('reconnect', () => {
        console.log('Reconnecting...');
    });
    client.on("connect", () => {
        // client.publish("/test/roleta", "hello world!")
        client.subscribe("/iot/roleta/babi");
        client.subscribe("/iot/roleta/babi/pong");
        client.publish("/iot/roleta/babi/ping", "");

    });
    let timeoutForerror;
    client.on("message", (topic, message) => {
        switch (topic) {
            case "/iot/roleta/babi/pong":
                setStatus(Number(message));
                window.clearTimeout(timeoutForerror);
                break;
        }
    });

    function insertRow(tableId, command, time, locationHtml) {
        var tableBody = document.getElementById(tableId + 'Body');
        var newRow = document.createElement('tr');
        var commandHtml = getHtmlCommand(command);

        console.log(locationHtml);
        newRow.innerHTML = '<td class="py-2 px-4">' + commandHtml + '</td><td class="py-2 px-4">' + time + '</td><td class="py-2 px-4">' + locationHtml + '</td>';
        tableBody.prepend(newRow, tableBody.firstChild); // Insert new row at the top to ensure latest time is at the top
    }

    function getHtmlCommand(command) {
        switch (Number(command)) {
            case 0:
                return '<i class="fa-solid fa-stop text-red-800"></i>';
            case 1:
                return '<i class="fa-solid fa-up-long text-green-800"></i>';
            case 2:
                return '<i class="fa-solid fa-down-long text-blue-800"></i>';
        }
    }

    function insertCommandHistory() {
        fetch('https://roleta.etiam.si/api/history/data/rcuid01')
            .then(response => response.json())
            .then(data => {
                // Sort the data based on cas in descending order (latest first)
                // Take only the latest 10 entries
                data.sort((a, b) => new Date(b.cas) - new Date(a.cas));
                // data.reverse();
                const latestEntries = data.slice(0, 100);
                latestEntries.reverse();
                let precentageOpen = 0;

                for (let i = 0; i < latestEntries.length; i++) {
                    let entry = latestEntries[i];
                    currentTime = new Date(entry.cas);
                    let nextTime;
                    if (i + 1 == latestEntries.length) {
                        nextTime = new Date();
                    } else {
                        nextTime = new Date(latestEntries[i + 1].cas);
                    }
                    var commandTime = Math.round((nextTime - currentTime) / 1000);
                    var precentageOpenHTML;

                    if (entry.ukaz != 0) {
                        if (commandTime) {
                            if (commandTime > 33) {
                                commandTime = getHtmlCommand(entry.ukaz);
                                if (entry.ukaz == 2) {
                                    precentageOpen = 0;
                                } else {
                                    precentageOpen = 1;
                                }
                            } else {
                                let predznak = 1;
                                if (entry.ukaz == 2) {
                                    predznak = -1;
                                }
                                precentageOpen += predznak * (commandTime / 33);
                                commandTime = (precentageFitZeroOne(precentageOpen) * 100).toFixed(0) + " %";
                                precentageOpenHTML = commandTime;
                                
                            }
                        }
                    } else {
                        commandTime = precentageOpenHTML;
                    }

                    insertRow('velikaRoletaTable', entry.ukaz, formatDate(currentTime), commandTime);

                }
            })
            .catch(error => console.error('Error fetching history data for rcuid01:', error));

        fetch('https://roleta.etiam.si/api/history/data/rcuid02')
            .then(response => response.json())
            .then(data => {
                // Sort the data based on cas in descending order (latest first)
                // Take only the latest 10 entries
                data.sort((a, b) => new Date(b.cas) - new Date(a.cas));
                // data.reverse();
                const latestEntries = data.slice(0, 100);
                latestEntries.reverse();
                let precentageOpen = 0;

                for (let i = 0; i < latestEntries.length; i++) {
                    let entry = latestEntries[i];
                    currentTime = new Date(entry.cas);
                    let nextTime;
                    if (i + 1 == latestEntries.length) {
                        nextTime = new Date();
                    } else {
                        nextTime = new Date(latestEntries[i + 1].cas);
                    }
                    var commandTime = Math.round((nextTime - currentTime) / 1000);
                    var precentageOpenHTML;

                    if (entry.ukaz != 0) {
                        if (commandTime) {
                            if (commandTime > 33) {
                                commandTime = getHtmlCommand(entry.ukaz);
                                if (entry.ukaz == 2) {
                                    precentageOpen = 0;
                                } else {
                                    precentageOpen = 1;
                                }
                            } else {
                                let predznak = 1;
                                if (entry.ukaz == 2) {
                                    predznak = -1;
                                }
                                precentageOpen += predznak * (commandTime / 33);
                                commandTime = (precentageFitZeroOne(precentageOpen) * 100).toFixed(0) + " %";
                                precentageOpenHTML = commandTime;
                                
                            }
                        }
                    } else {
                        commandTime = precentageOpenHTML;
                    }

                    insertRow('malaRoletaTable', entry.ukaz, formatDate(currentTime), commandTime);

                }
            })
            .catch(error => console.error('Error fetching history data for rcuid02:', error));
    }

    function formatDate(date) {
        date.setHours(date.getHours() - 2);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero based, so we add 1
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        return `${day}.${month}.${year}, ${hours}:${minutes}:${seconds}`;
    }

    function precentageFitZeroOne(num) {
        if (num > 1) {
            return 1;
        } else if (num < 0) {
            return 0;
        }
        return Number(num.toFixed(2));
    }

    // Call insertCommandHistory when needed
    insertCommandHistory();





    // Function to set status

    function setStatus(code) {
        const statusElement = document.getElementById('statusElement');
        const statusText = document.getElementById('statusText');

        // Determine the color based on the status code
        let bgColor;
        statusText.innerHTML = code;
        if (code == 200) {
            bgColor = "bg-green-500"
            statusText.innerHTML = 'Deluje <i class="fa-solid fa-circle-check"></i>';
        } else {
            bgColor = "bg-orange-500"
        }
        // Apply the background color
        statusElement.className = `p-3 rounded-lg shadow-lg text-white ${bgColor}`;
    }

    // Example usage
    setStatus("Getting status...")
    timeoutForerror = window.setTimeout(() => {
        setStatus("Not Working!")
    }, 5500);
    // setStatus(500);  // You can change this to any status code to test
});