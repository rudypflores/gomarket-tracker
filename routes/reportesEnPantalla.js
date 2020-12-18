const express = require('express');
const router = express.Router();
const pool = require('../db');
const fastCsv = require('fast-csv');
const fs = require('fs');

// Set static file location
router.use(express.static('public'));
router.use('/css', express.static(__dirname + 'public/css'));
router.use('/js', express.static(__dirname + 'public/js'));
router.use('/img', express.static(__dirname + 'public/images'));

/* Ventas Detalladas */
router.get('/ventas-detalladas', (req,res) => {
    res.render('tabs/reportes-en-pantalla/ventasDetalladas');
});

/* Ventas (Pagos) */
router.get('/ventas-pagos', (req,res) => {
    res.render('tabs/reportes-en-pantalla/ventasPagos');
});

/* Compras (Pagos) */
router.get('/compras-pagos', (req,res) => {
    res.render('tabs/reportes-en-pantalla/comprasPagos');
});

/* Devolucion de Ventas */
router.get('/devolucion-de-ventas', (req,res) => {
    res.render('tabs/reportes-en-pantalla/devolucionDeVentas');
});

/* Precios y Existencias */
router.get('/precios-y-existencias', (req,res) => {
    res.render('tabs/reportes-en-pantalla/preciosYExistencias');
});

/* Inventario Actual */
router.get('/inventario-actual', (req,res) => {
    res.render('tabs/reportes-en-pantalla/inventarioActual');
});

/* Productos Mas Vendidos */
router.get('/productos-mas-vendidos', (req,res) => {
    res.render('tabs/reportes-en-pantalla/productosMasVendidos');
});

/* Productos por Fecha de Vencimiento */
router.get('/productos-por-fecha-de-vencimiento', (req,res) => {
    res.render('tabs/reportes-en-pantalla/productosPorFechaDeVencimiento');
});

module.exports = router;