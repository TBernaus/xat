const bcrypt = require('bcrypt');
var User = require("../models/usuari");

exports.getAllUsers = async () => {
    try {
        const usuaris = await User.find({});
        return usuaris;
    } catch (error) {
        console.error(`Error getting all users ${error}`);
    }
};

exports.getRol = async (req) => {
    try {
        if (req.session && req.session.username) {
            const usuario = await User.findOne({ username: req.session.username });
            if (usuario) {
                return usuario.rol;
            } else {
                return null; 
            }
        } else {
            return null; 
        }
    } catch (error) {
        console.error(`Error obteniendo el rol del usuario: ${error}`);
        return null;
    }
};

exports.crearUser = async (username, pass) => {
    try{ 
        const xifrada = await bcrypt.hash(pass, 10); 

        const newUser = new User({ username, pass:xifrada, rol:'user' });
        await newUser.save();
    } catch (er){
        console.error(`Error creant el nou usuari. ${er}`)
    }
}
exports.crearAdmin = async (username, pass) => {
    try{
        const xifrada = await bcrypt.hash(pass, 10); 
        const newUser = new User({ username, pass:xifrada, rol:'admin' });
        await newUser.save();
    } catch (er){
        console.error(`Error creant el nou usuari. ${er}`)
    }
}

exports.existent = async (username) => {
    try {
        const existingUser = await User.findOne({ username: username });
        return existingUser !== null;
    } catch (error) {
        console.error(`Error al buscar usuario: ${error}`);
        return false;
    }
}
