const usb = require("usb")
const moment = require("moment")
const io = require('socket.io')(8088, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
    }
});
const models = require("./models")

var sp;
var serial = require("serialport");

const { Op } = require("sequelize")

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
                                switch (s) {
                                    case 'h': models.moisureA.create({ data: v }); break;
                                    case 's': models.moisureS.create({ data: v }); break;
                                    case 't': models.temperature.create({ data: v }); break;
                                    case 'l': models.light.create({ data: v }); break;
                                    default: break;
                                }
                                io.emit(s, parseInt(v))
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
    client.on("begin", () => {
        console.log("begin");
        loop(client)
    })
    client.on("CAP001_ON", () => {
        sp.write("CAP001_ON")
        console.log("on");
    })
    client.on("CAP001_OFF", () => {
        sp.write("CAP001_OFF")
        console.log("off");
    })
    client.on("data", ({ dateDebut, dateFin, type }) => {
        let dates = [new Date(moment(dateDebut).format("YYYY-MM-DD")), new Date(moment(dateFin).add(1, 'day').format("YYYY-MM-DD"))]
        console.log(dates);
        models[type].findAll({
            where: { createdAt: { [Op.between]: dates, } },
            order: [['createdAt', 'ASC']],
            attributes: { exclude: ['id', 'updatedAt'] }
        })
            .then(data => {
                let donnees = data.map(d => ({data : d.dataValues.data, createdAt : moment(d.dataValues.createdAt).format("YYYY-MM-DD") }))
                console.log(donnees);
                io.emit("res", donnees)
            })
    })
});
