const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {

    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ message: "No se proporcionó un token de acceso" });
    }

    try {
        const basicToken = token.split(" ")[1] || token;
        
        const decoded = jwt.verify(basicToken, process.env.JWT_SECRET);
        
        req.user = decoded; 
        
        next();
    } catch (error) {
        return res.status(401).json({ message: "Token inválido o expirado" });
    }
};

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.rol)) {
            return res.status(403).json({ 
                message: `Acceso denegado: Se requiere rol [${roles}]` 
            });
        }
        next();
    };
};



module.exports = { verifyToken, authorizeRoles};