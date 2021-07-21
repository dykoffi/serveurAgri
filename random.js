const d3 = require("d3")
const models = require("./models")
const valeur = require("./index")

setInterval(() => {
    models.light.create({ data: d3.randomInt(100)() })
    models.moisureA.create({ data: d3.randomInt(100)() })
    models.moisureS.create({ data: d3.randomInt(100)() })
    models.temperature.create({ data: d3.randomInt(100)() })
}, 500);
