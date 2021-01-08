const express = require('express');
const router = express.Router();
const pool = require('../db');
const movimientos = require('./movimientos');
const mantenimientos = require('./mantenimientos');
const reportes = require('./reportes');
const reportesEnPantalla = require('./reportesEnPantalla');

// Set static file location
router.use(express.static('public'));
router.use('/css', express.static(__dirname + 'public/css'));
router.use('/js', express.static(__dirname + 'public/js'));
router.use('/img', express.static(__dirname + 'public/images'));

// Sub-Routers
router.use('/movimientos', movimientos);
router.use('/mantenimientos', mantenimientos);
router.use('/reportes', reportes);
router.use('/reportes-en-pantalla', reportesEnPantalla);

// User dashboard
router.get('/', (req,res) => {
    if(req.user.cargo === 'administrador')
        res.render('home-admin', { user: req.user.nombre, marketName: req.user.market_id });
    else if(req.user.cargo === 'empleado')
        res.render('home-employee', { user: req.user.nombre, marketName: req.user.market_id });
});

module.exports = router;