const Sequelize = require('sequelize');

const { User } = require('../models/index');
const objSockets = require('../app');

module.exports = {
    insertRow: async function (req, res) {
        const { body } = req;
        console.log(body);
        try {
            const users = (await User.sync({ force: false }).then(() => {
                User.create({
                    name: body.name,
                    surname: body.surname,
                    email: body.email,
                    coordLongitude: body.coordLongitude,
                    coordLatitude: body.coordLatitude,
                });
            }));

            objSockets.objSockets().emit('connection_custom', { url: 'http://localhost:3000/api/select' });

            res.status(200).json({
                success: true,
            });
        } catch (error) {
            console.error(error);
            res.status(500).send();
        }
    },
    updateRow: async function (req, res) {
        const { body } = req;
        try {
            const user = (await User.findOne({ where: { id: body.id } }));
            (await user.update({
                name: body.name,
                surname: body.surname,
                email: body.email,
                coordLongitude: body.coordLongitude,
                coordLatitude: body.coordLatitude,
            }));

            objSockets.objSockets().emit('connection_custom', { url: 'http://localhost:3000/api/select' });

            res.status(200).json({
                success: true,
            });
        } catch (error) {
            console.error(error);
            res.status(500).send();
        }
    },
    deleteRow: async function (req, res) {
        const { body } = req;
        try {
            const user = (await User.findOne({ where: { id: body.id } }));
            (await user.destroy());

            objSockets.objSockets().emit('connection_custom', { url: 'http://localhost:3000/api/select' });

            res.status(200).json({
                success: true,
            });
        } catch (error) {
            console.error(error);
            res.status(500).send();
        }
    },
};
