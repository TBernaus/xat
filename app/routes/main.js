
var path = require("path");
var controllerDir = "../controllers";
var usersController = require(path.join(controllerDir, "usuaris"));
var express = require("express");
const session = require("express-session");
var router = express.Router();
const middleware = require('./middlewares');
const bcrypt = require('bcrypt');


router.use(session({
    secret: 'ClauSecreta', 
    resave: false,
    saveUninitialized: true
}));


//rutas
router.get("/", async (req, res, next) => {
    const error = req.query.error; 
    const username = req.session.username
    console.log("Benvingut! \n")
    res.render('login-page', { error, username:username });
});

router.get('/info', (req, res) => {
    const username = req.session.username
    res.render('info', { username:username });
});

// registre d'usuaris
router.get('/registre', (req, res) => {
    const username = req.session.username
    res.render('registre', { username:username });
});

router.post('/registre', (req, res) => {
    const username = req.session.username
    res.render('registre', { username:username });
});

router.post("/save", middleware.guardarUsuari);


//logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
        }
        res.redirect('/');
    });
});

router.get("/error", async (req, res) => {
    const error = req.query.error;
    const username = req.session.username;
    res.render('error', {error:error, username:username });
});

/* Accés només a usuaris */

router.post('/admin/welcome', middleware.userCorrecte, (req, res) => {
    req.session.username = req.body.username;
    const username = req.session.username
    res.render('admin/welcome', { username:username });
});

router.get("/admin/welcome",middleware.isAuth, async (req, res, next) => {
    const username = req.session.username
    res.render("admin/welcome", { username:username });
});
router.get("/admin/info",middleware.isAuth, async (req, res, next) => {
    const username = req.session.username
    res.render("admin/info", { username:username });
});


// creació usuaris
router.post("/admin/save",middleware.isAuth, middleware.guardarAdmin);

router.get("/admin/create",middleware.isAuth, async (req, res, next) => {
    const username = req.session.username
    const rol = await usersController.getRol(req);
    res.render("admin/create", { username:username, rol:rol });
});


// xat
const Message = require('../models/message');

router.post('/admin/xat/:xat', middleware.isAuth, async (req, res) => {
    const xat = req.body.xat;
    res.redirect(`/admin/xat/${xat}`);
});

router.get('/admin/xat/:xat', middleware.isAuth, middleware.getXat, (req, res) => {
    res.render("admin/xat", {
        username: res.locals.username,
        xat: res.locals.xat,
        messages: res.locals.messages,
        usuaris: res.locals.usuaris
    });
});

// historial
router.get('/admin/historial', middleware.isAuth, async (req, res) => {
    try {
        const username = req.session.username;
        const messages = await Message.find({ username: username });
        const rol = await usersController.getRol(req);

        res.render('admin/historial', { username, messages, rol:rol });
    } catch (error) {
        console.error('Error al recuperar el historial de mensajes:', error);
        res.status(500).send('Error al recuperar el historial de mensajes');
    }
});

router.post('/admin/historial/:id', middleware.isAuth, async (req, res) => {
    const id = req.params.id;

    const eliminat = await Message.findByIdAndDelete(id)
    if(eliminat){
        console.log('eliminat amb exit')
        res.redirect('/admin/historial')
    } else {
        console.log("missatge no eliminat")
        res.redirect('/error?error=noEliminat')
    }
});

router.post('/admin/historial/delete/:username', async (req, res) => {
    const username = req.params.username;
    try {
        await Message.deleteMany({ xat: username });
        res.redirect('/admin/historial'); 
    } catch (error) {
        console.error(`Error eliminant els missatges: ${error}`);
        res.redirect('/error?error=noEliminats');
    }
});

module.exports = router;
