const models = require("./models")

models.light.findAll({ attributes: { exclude: ['id', 'updatedAt'] } })
    .then(data => {
        console.log(data.map(d => d.dataValues));
    })