const express = require('express');
const router = express.Router();
const movimientos = require('./movimientos');
const mantenimientos = require('./mantenimientos');
const reportes = require('./reportes');
const reportesEnPantalla = require('./reportesEnPantalla');

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
    else if(req.user.cargo === 'encargado')
        res.render('home-encargado', { user: req.user.nombre, marketName: req.user.market_id });
});

module.exports = router;