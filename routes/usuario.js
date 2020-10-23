const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');

// Set static file location
router.use(express.static('public'));
router.use('/css', express.static(__dirname + 'public/css'));
router.use('/js', express.static(__dirname + 'public/js'));
router.use('/img', express.static(__dirname + 'public/images'));

// Create new usuario
router.post('/', async (req,res) => {
    try {
        const { 
            nUsuario,
            nombre,
            apellido,
            pass,
            cargo,
            estado,
            direccion,
            celular
        } = req.body;

        const hashedPassword = await bcrypt.hash(pass, 10);
        const isDuplicate = await pool.query(`SELECT * FROM usuario WHERE n_usuario = $1`, [nUsuario]);

        if(isDuplicate.rows.length > 0) {
            res.json('Usuario ya existe.');
        } 
        else {
            const newUsuario = await pool.query("INSERT INTO usuario(n_usuario, nombre, apellido, pass, cargo, estado, direccion, celular) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *", 
                                            [nUsuario, nombre, apellido, hashedPassword, cargo, estado, direccion, celular]);
            res.redirect(`${req.query.url}`);
        }
    } catch (err) {
        console.error(err.message);
    }
});

// Get all usuarios
router.get('/', async (req,res) => {
    try {
        const allUsuarios = await pool.query("SELECT * FROM usuario");
        res.json(allUsuarios.rows);
    } catch (err) {
        console.error(err.message);
    }
});

// Get specific usuario
router.get('/:id', async (req,res) => {
    try {
        const { id } = req.params;
        const specificUsuario = await pool.query(`SELECT * FROM usuario
                                                  WHERE n_usuario = $1`,
                                                  [id]);
        res.json(specificUsuario.rows[0]);
    } catch (err) {
        console.error(err.message);
    }
});

// Get currently logged in usuario
router.get('/current', async (req,res) => {
    try {
        res.json(res.locals.currentUser);
    } catch (err) {
        console.error(err.message);
    }
});

// Update a specific usuario
router.put('/', async (req,res) => {
    try {
        const { 
            nUsuario,
            nombre,
            apellido,
            cargo,
            estado,
            direccion,
            celular
        } = req.body;

        const updateUsuario = await pool.query("UPDATE usuario SET nombre = $2, apellido = $3, cargo = $4, estado = $5, direccion = $6, celular = $7 WHERE n_usuario = $1",
                                                [nUsuario, nombre, apellido, cargo, estado, direccion, celular]);

        res.redirect('/dashboard');
    } catch (err) {
        console.error(err.message);
    }
});

// Delete a specific usuario
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleteUsuario = await pool.query("DELETE FROM usuario WHERE uid = $1", [id]);

        res.json('usuario was deleted successfully!');
    } catch (err) {
        console.error(err.message);
    }
});

module.exports = router;