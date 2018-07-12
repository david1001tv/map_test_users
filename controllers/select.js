const Sequelize = require('sequelize');
const sequelize = require('../models/sequelize');
const { User } = require('../models/index');
const Op = Sequelize.Op;

// For todays date;
Date.prototype.today = function () { 
    return this.getFullYear() +'-'+(((this.getMonth()+1) < 10)?'0':'') + (this.getMonth()+1) +'-'+ ((this.getDate() < 10)?'0':'') + this.getDate();
}

// For the time now
Date.prototype.timeNow = function () {
     return ((this.getHours() < 10)?'0':'') + this.getHours() +':'+ ((this.getMinutes() < 10)?'0':'') + this.getMinutes() +':'+ ((this.getSeconds() < 10)?'0':'') + this.getSeconds();
}

module.exports = {
    selectAll: async function (req, res) {
        const { body } = req;
        try {
            const users = (await User.findAll());
            console.log('get data success!');
            let newDate = new Date();
            let time = newDate.today() + ' ' + newDate.timeNow();
            res.status(200).json({
                success: true,
                users: users,
                time: time,
            });
        } catch (error) {
            console.error(error);
            res.status(500).send();
        }
    },
    selectNew: async function(req, res) {
        const { body } = req;
        try {
            if(body.time === null) {
                console.error('no last time!');
                res.status(401).send();
            }
            const users = (await User.findAll( { where: { updatedAt: { [Op.gt]: body.time } } } ));
            console.log('get data success!');
            let time = new Date().today() + ' ' + new Date().timeNow();
            res.status(200).json({
                success: true,
                users: users,
                time: time,
            })
        } catch (error) {
            console.error(error);
            res.status(500).send();
        }
    } 
};
