const sequelize = require('../models/sequelize');
const { User } = require('../models/index');

module.exports = {
    selectRow: async function (req, res) {
        const {body} = req;
        try {
            const users = (await User.findAll());
            console.log('get data success!');
            res.status(200).json({
                success: true,
                users: users,
            });
        } catch (error) {
            console.error(error);
            res.status(500).send();
        }
    },
};
