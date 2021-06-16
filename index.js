const io = require('socket.io')(8080, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
    }
});
const usb = require("usb")

var sp;
var serial = require("serialport");


io.on('connection', client => {
    console.log("ok connection");
    function loop() {
        if (!(sp instanceof serial)) {
            serial.list()
                .then(ports => {
                    ports.forEach(p => { if (p.pnpId) { sp = new serial(p.path, { baudRate: 115200 }) } });
                    if (sp instanceof serial) {
                        sp.on("open", () => { console.log("port ouvert") })
                        sp.on("close", () => { console.log("port fermé"); sp = undefined })
                        
                        let initS = ""
                        sp.on("data", (data) => {
                            initS = data.toString();
                            if (/^(e|h|s|t|l)_\d+\.?\d*/.test(initS)) {
                                initS = initS.replace(/(\r\n|\n|\r)/, "")
                                let tabS = initS.split("_");
                                let [s, v] = tabS
                                client.emit(s, parseInt(v))
                            }
                        })
                    } else { console.log("no device"); }
                })
                .catch(err => { console.error(err); })
        } else { console.log("device") }
    }
    
    
    usb.on("attach", () => {
        loop()
    })
    usb.on("detach", () => {
        sp = undefined 
    })
    client.on("begin", () => loop(client))
    client.on("CAP001_ON", () => {
        sp.write("CAP001_ON")
        console.log("on");
    })
    client.on("CAP001_OFF", () => {
        sp.write("CAP001_OFF")
        console.log("off");
    })
});