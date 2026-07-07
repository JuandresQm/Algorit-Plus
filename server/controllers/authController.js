const { Op } = require('sequelize');
const { User, Log, Lesson, UserProgress } = require('../models');
const { getCurrentStreak } = require('../utils/streak');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const transporter = require('../utils/mailer');

const forgotPassword = async (req, res) => {
    const { identifier } = req.body;
    try {
        const user = await User.findOne({
            where: {
                [Op.or]: [
                    { email: identifier },
                    { username: identifier }
                ]
            }
        });
        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

        const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
        const resetUrl = `${process.env.FRONT_URL}/recuperar/${resetToken}`;

        await transporter.sendMail({
            from: '"Algorit+ Soporte" <tu_correo@gmail.com>',
            to: user.email,
            subject: "Recuperar Contraseña - Algorit+",
            html: `<b>Hola, ${user.username}</b>
                   <p>Haz clic en el siguiente enlace para cambiar tu clave:</p>
                   <a href="${resetUrl}">Ingresa aquí para restablecer tu contraseña</a>`
        });

        res.json({ message: "Correo enviado con éxito" });
    } catch (error) {
        res.status(500).json({ message: "Error al procesar la solicitud" });
    }
};
const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await user.update({ password: hashedPassword });

        await Log.create({
            userId: user.id,
            action: 'Cambio de Contraseña',
            details: 'El usuario restableció su contraseña mediante recuperación por correo',
            ipAddress: req.ip || req.connection.remoteAddress,
            loginTime: new Date()
        });

        res.json({ message: "Contraseña actualizada con éxito." });

    } catch (error) {
        res.status(400).json({ message: "El enlace es inválido o ha expirado." });
    }
};
const register = async (req, res) => {
    try {
        const { name, lastname, email, username, password } = req.body;

        if (!name || !lastname || !email || !username || !password) {
            return res.status(400).json({ message: "Todos los campos son obligatorios" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            name,
            lastname,
            email,
            username,
            password: hashedPassword
        });

        const firstLesson = await Lesson.findOne({ 
            order: [['order', 'ASC']] 
        });

        if (firstLesson) {
            await UserProgress.create({
                userId: newUser.id,
                lessonId: firstLesson.id,
                completed: false,
                score: 0,
                completionDate: null
            });
        }

        await Log.create({
            userId: newUser.id,
            action: 'Registro',
            ipAddress: req.ip,
            details: 'Registro de nuevo usuario'
        });

         transporter.sendMail({
            from: '"Algorit+ Soporte" <tu_correo@gmail.com>',
            to: newUser.email,
            subject: "Registro exitoso - Algorit+",
            html: `<b>Hola, ${newUser.username}</b>
                   <p>Muchas gracias por registrarte a Algorit+</p>`
        }).catch(mailError => console.error("Error enviando email de bienvenida:", mailError));

     
        return res.status(201).json({ message: "Usuario creado con éxito", user: newUser });

    } catch (error) {
        console.error("ERROR EN REGISTRO:", error);
        return res.status(500).json({ message: "Error al crear usuario", error: error.message });
    }
};
const login = async (req, res) => {
    const { identifier, password } = req.body;

    try {
       const user = await User.findOne({
            where: {
                [Op.or]: [
                    { username: identifier },
                    { email: identifier }
                ]
            }
        });
        if (!user) {
            return res.status(401).json({ message: "Usuario no encontrado" });
        }
      
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Contraseña incorrecta" });
        }
       
        const token = jwt.sign(
            { id: user.id, username: user.username, rol: user.rol },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        const nuevoLog = await Log.create({
    userId: user.id,
    action: 'Inicio de sesión',
    ipAddress: req.ip,
    details: 'Inicio de sesión estándar'
});
        res.status(200).json({
            message: "Inicio de sesión exitoso",
            token,
            logId: nuevoLog.id,
            user: {
              id: user.id,
              username: user.username,
              rol: user.rol,
              avatar: user.avatar,
              streakCount: user.streakCount || 0,
              lastActionDate: user.lastActionDate || null,
              currentStreak: getCurrentStreak(user)
            }
        });
        
    } catch (error) {
        res.status(500).json({ message: "Error en el servidor" });
    }
};

const checkToken = async (req, res) => {
    try {
        res.status(200).json({
            ok: true,
            user: req.user
        });
    } catch (error) {
        res.status(500).json({ message: "Error en el servidor" });
    }
};
const logout = async (req, res) => {
    const { logId } = req.body;

    try {
        if (!logId) {
            return res.status(400).json({ message: "No se proporcionó el ID de sesión" });
        }

        const log = await Log.findByPk(logId);
        if (log) {
            const salida = new Date();
            const ingreso = new Date(log.loginTime);
            
            const diferenciaMs = salida - ingreso;
            
            const horas = Math.floor(diferenciaMs / 3600000).toString().padStart(2, '0');
            const minutos = Math.floor((diferenciaMs % 3600000) / 60000).toString().padStart(2, '0');
            const segundos = Math.floor((diferenciaMs % 60000) / 1000).toString().padStart(2, '0');
            const duracionFormateada = `${horas}:${minutos}:${segundos}`;

            await log.update({
                logoutTime: salida,
                duration: duracionFormateada,
                action: 'Cierre de sesión',
                details: 'El usuario cerró sesión exitosamente'
            });

            return res.status(200).json({ message: "Sesión cerrada en bitácora" });
        }
        res.status(404).json({ message: "Registro no encontrado" });
    } catch (error) {
        res.status(500).json({ message: "Error al cerrar sesión" });
    }
};
module.exports = { register, login, checkToken, logout, forgotPassword, resetPassword };