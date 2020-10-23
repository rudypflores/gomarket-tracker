const express = require('express');
const router = express.Router();
const pool = require('../db');
const movimientos = require('./movimientos');
const mantenimientos = require('./mantenimientos');
const reportes = require('./reportes');

// Set static file location
router.use(express.static('public'));
router.use('/css', express.static(__dirname + 'public/css'));
router.use('/js', express.static(__dirname + 'public/js'));
router.use('/img', express.static(__dirname + 'public/images'));

// Sub-Routers
router.use('/movimientos', movimientos);
router.use('/mantenimientos', mantenimientos);
router.use('/reportes', reportes);

// User dashboard
router.get('/', (req,res) => {
    res.render('home', { user: req.user.nombre });
});

module.exports = router;