
var path = require("path");
var controllerDir = "../controllers";
var usersController = require(path.join(controllerDir, "usuaris"));
const bcrypt = require('bcrypt');
const Message = require('../models/message');

async function userCorrecte(req, res, next) {
    try {
        const { username, pass } = req.body;
        const users = await usersController.getAllUsers();

        if (!users) {
            return res.redirect('/?error=databaseError');
        }

        const user = users.find(user => user.username === username);

        if (user) {
            const passCorrecte = await bcrypt.compare(pass, user.pass);

            if (passCorrecte) {
                next();
            } else {
                res.redirect('/?error=wrongPassword');
            }
        } else {
            res.redirect('/?error=wrongUser');
        }
    } catch (error) {
        console.error('Error getting users:', error);
        res.redirect('/?error=databaseError');
    }
}

function isAuth(req, res, next) {
    if (req.session && req.session.username) {
        next();
    } else {
        res.redirect('/?error=Auth');
    }
}

async function guardarUsuari(req, res, next) {
    const user = req.body.username;
    const pass = req.body.pass;
    const username = req.session.username;

    try {
        const existent = await usersController.existent(user);
        if (existent) {
            res.redirect('/error?error=existingUser');
        } else {          
            await usersController.crearUser(user, pass);   
            res.render("save", {user: user, username: username});
        }
    } catch (error) {
        console.error(error);
        res.redirect('/error?error=existingUser');
    }
}

async function guardarAdmin(req, res, next) {
    const isAdmin = req.body.isadmin;
    const user = req.body.username;
    const pass = req.body.pass;
    const username = req.session.username;

    try {
        const existent = await usersController.existent(user);
        if (existent) {
            res.redirect('/error?error=existingUser');
        } else {
            if (isAdmin === 'on') {
                await usersController.crearAdmin(user, pass);
            } else {
                await usersController.crearUser(user, pass);
            }
            
            res.render("admin/save", { user: user, username: username });
        }
    } catch (error) {
        console.error(error);
        res.redirect('/error?error=existingUser');
    }
}

async function getXat(req, res, next) {
    const xat = req.params.xat;
    const username = req.session.username;

    try {
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
        const usuaris = await Message.distinct('username', { xat: xat });

        const messages = await Message.find({ xat: xat });
        
        res.locals.username = username;
        res.locals.xat = xat;
        res.locals.messages = messages;
        res.locals.usuaris = usuaris;
        next();
    } catch (error) {
        console.error('Error al recuperar el xat:', error);
        res.status(500).send('Error interno al intentar recuperar la sala del xat');
    }
}

module.exports = { userCorrecte, isAuth, guardarUsuari, guardarAdmin, getXat };
