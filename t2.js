var usb = require("usb")
var serial = require("serialport");
const fs = require("fs");
var sp

if (!(sp instanceof serial)) {
    serial.list()
        .then(ports => {
            ports.forEach(p => {
                if (p.pnpId)
                    sp = new serial(p.path, {
                        baudRate: 115200
                    })
            });
            if (sp instanceof serial) {
                sp.on("open", () => {
                    console.log("port ouvert");
                })
                sp.on("close", () => {
                    console.log("port fermé");
                    sp = undefined
                })
                let initJ = {}
                let initS = ""
                sp.on("data", (data) => {
                    initS = data.toString();
                    if (/^(e|h|s|t|l)_\d+\.?\d+/.test(initS)) {
                        initS = initS.replace(/(\r\n|\n|\r)/, "")
                        let tabS = initS.split("_");
                        console.log(tabS);
                        
                    }
                })
            } else {
                console.log("no device");
            }
        })
        .catch(err => {
            console.error(err);
        })
} else {
    console.log("device")
}