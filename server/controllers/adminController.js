const { User, Log } = require('../models/index');
const { exec } = require('child_process');
const path = require('path');

exports.downloadBackup = (req, res) => {
    const ahora = new Date();
const fecha = ahora.toISOString().slice(0, 10);
const hora = ahora.toLocaleTimeString('en-GB').replace(/:/g, '-'); 

const fileName = `backup-algorit-${fecha}--${hora}.sql`;

    const filePath = path.join(__dirname, `../../backups/${fileName}`);
    

    const cmd = `pg_dump -U ${process.env.DB_USER} -h ${process.env.DB_HOST} -d ${process.env.DB_NAME} -f "${filePath}"`;


    exec(cmd, { env: { ...process.env, PGPASSWORD: process.env.DB_PASSWORD } }, async (error) => {
        if (error) {
            console.error('Error al crear respaldo:', error);
            return res.status(500).json({ message: "Error al generar respaldo" });
        }

        try {
            await Log.create({
                userId: req.user.id,
                action: 'Descarga de Respaldo',
                details: `El administrador ${req.user.username} generó un respaldo de la base de datos`,
                ipAddress: req.ip || req.connection.remoteAddress,
                loginTime: new Date()
            });

            res.download(filePath, fileName);
        } catch (dbError) {
            console.error("Error al guardar bitácora:", dbError);
            res.download(filePath, fileName);
        }
    });
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'username', 'email', 'rol', 'name', 'lastname']
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener usuarios" });
    }
};

exports.updateUserRole = async (req, res) => {
    const { id } = req.params;
    const { rol } = req.body;
    try {
        const user = await User.findByPk(id);
        if (user && (rol === "docente" || rol === "usuario")) {
            await user.update({ rol });

            await Log.create({
                userId: req.user.id, 
                action: 'Edición',
                details: `Cambió rol de usuario ID ${id} a ${rol}`
            });
            return res.json({ message: "Rol actualizado con éxito" });
        }
        res.status(404).json({ message: "Usuario no encontrado" });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar rol" });
    }
};

exports.getLogs = async (req, res) => {
    try {
        const logs = await Log.findAll({
            include: [{
                model: User,
                as: 'user',
                attributes: ['username']
            }],
            order: [['loginTime', 'DESC']]
        });
        res.json(logs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener logs" });
    }
};