const express = require('express');
const router = express.Router();
const pool = require('../db');
const folder = 'tabs/mantenimientos';

// Set static file location
router.use(express.static('public'));
router.use('/css', express.static(__dirname + 'public/css'));
router.use('/js', express.static(__dirname + 'public/js'));
router.use('/img', express.static(__dirname + 'public/images'));

/* Catalogo de Productos */
// Nuevo Producto
router.get('/nuevo-producto', (req,res) => {
    res.render(`${folder}/catalogo-de-productos/nuevoProducto`);
});
// Editar Producto
router.get('/editar-producto', (req,res) => {
    res.render(`${folder}/catalogo-de-productos/editarProducto`);
})

router.get('/producto', async (req,res) => {
    try {
        const productos = await pool.query(`SELECT * FROM producto`);
        res.json(productos.rows);
    } catch (err) {
        console.error(err.message);
    }
});

router.get('/producto/:codigo', async (req,res) => {
    try {
        const { codigo } = req.params;
        const specificProducto = await pool.query(`SELECT * FROM producto
                                                   WHERE codigo = $1`,
                                                   [codigo]);
        res.json(specificProducto.rows[0]);
    } catch (err) {
        console.error(err.message);
    }
});

router.post('/producto', async (req,res) => {
    try {
        console.log(req.body);
        const {
            codigo,
            nombre,
            costoQ,
            precioPublico,
            pUtilidad,
            ubicacion,
            estado,
            vencimiento
        } = req.body;

        const newProducto = await pool.query(`INSERT INTO producto (codigo, nombre, costo_q, precio_publico, p_utilidad, ubicacion, estado, vencimiento)
                                              VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
                                              [codigo, nombre, costoQ, precioPublico, pUtilidad, ubicacion, estado, vencimiento]);

        res.redirect('/dashboard');
    } catch (err) {
        console.error(err.message);
    }
});

router.put('/producto', async (req,res) => {
    console.log(req.body);
    const {
        codigo,
        nombre,
        costoQ,
        pUtilidad,
        precioPublico,
        ubicacion,
        estado,
        vencimiento
    } = req.body;

    const updateProducto = await pool.query(`UPDATE producto 
                                             SET nombre = $1, costo_q = $2, precio_publico = $3, p_utilidad = $4, ubicacion = $5, estado = $6, vencimiento = $7
                                             WHERE codigo = $8`,
                                             [nombre, costoQ, pUtilidad, precioPublico, ubicacion, estado, vencimiento, codigo]);

    res.redirect('/dashboard');
});

/* Actualizar existencias */
router.get('/actualizar-existencias', (req,res) => {
    res.render(`${folder}/actualizarExistencias`);
});

router.put('/actualizar-existencias', async (req,res) => {
    try {
        const { 
            codigo,
            producto,
            unidadesActuales,
            agregarODescontar,
            descripcion
         } = req.body;

        const nuevaExistencia = unidadesActuales-agregarODescontar;
        console.log(nuevaExistencia);
        console.table(req.body);

        const editarInventario = await pool.query(`UPDATE inventario
                                                   SET existencia_actual = $1
                                                   WHERE codigo = $2
                                                   RETURNING *`, [nuevaExistencia, codigo]);

        res.redirect('/dashboard');
    } catch (err) {
        console.error(err.message);
    }
});

/* Altas y Bajas de Productos */
router.get('/altas-bajas-productos', (req,res) => {
    res.render(`${folder}/altasBajasProductos`);
});

/* Usuarios */
// Nuevo Usuario
router.get('/nuevo-usuario', (req,res) => {
    res.render(`${folder}/usuarios/nuevoUsuario`);
});
// Editar Usuario
router.get('/editar-usuario', (req,res) => {
    res.render(`${folder}/usuarios/editarUsuario`);
});

/* Clientes */
// Nuevo Cliente
router.get('/nuevo-cliente', (req,res) => {
    res.render(`${folder}/clientes/nuevoCliente`);
});
// Editar Cliente
router.get('/editar-cliente', (req,res) => {
    res.render(`${folder}/clientes/editarCliente`);
});

router.get('/cliente', async (req,res) => {
    try {
        const clientes = await pool.query(`SELECT * FROM cliente`);
        res.json(clientes.rows);
    } catch (err) {
        console.error(err.message);
    }
});

router.get('/cliente/:codigo', async (req,res) => {
    try {
        const { codigo } = req.params;
        const specificCliente = await pool.query(`SELECT * FROM cliente
                                                  WHERE codigo = $1`,
                                                  [codigo]);
        res.json(specificCliente.rows[0]);
    } catch (err) {
        console.error(err.message);
    }
});

router.post('/cliente', async (req,res) => {
    try {
        const {
            codigo,
            nit,
            nombre,
            apellido,
            direccion,
            celular
        } = req.body;

        const newCliente = pool.query(`INSERT INTO cliente (codigo, nit, nombre, apellido, direccion, celular)
                                       VALUES ($1,$2,$3,$4,$5,$6)`,
                                       [codigo, nit, nombre, apellido, direccion, celular]);
        
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err.message);
    }
});

router.put('/cliente', async (req,res) => {
    try {
        const {
            codigo,
            nit,
            nombre,
            apellido,
            direccion,
            celular
        } = req.body;

        const updateCliente = pool.query(`UPDATE cliente 
                                          SET nit = $2, nombre = $3, apellido = $4, direccion = $5, celular = $6
                                          WHERE codigo = $1`,
                                          [codigo, nit, nombre, apellido, direccion, celular]);
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err.message);
    }
});

/* Proveedores */
// Nuevo Proveedor
router.get('/nuevo-proveedor', (req,res) => {
    res.render(`${folder}/proveedores/nuevoProveedor`);
});
// Editar Proveedor
router.get('/editar-proveedor', (req,res) => {
    res.render(`${folder}/proveedores/editarProveedor`);
});

router.get('/proveedor', async (req,res) => {
    try {
        const proveedores = await pool.query(`SELECT * FROM proveedor`);
        res.json(proveedores.rows);
    } catch (err) {
        console.error(err.message);
    }
});

router.get('/proveedor/:codigo', async (req,res) => {
    try {
        const { codigo } = req.params;
        const specificProveedor = await pool.query(`SELECT * FROM proveedor
                                                    WHERE codigo = $1`,
                                                    [codigo]);
        res.json(specificProveedor.rows[0]);
    } catch (err) {
        console.error(err.message);
    }
});

router.post('/proveedor', async (req,res) => {
    try {
        const {
            nit,
            nombre,
            direccion,
            celular,
            saldo
        } = req.body;

        const newProveedor = await pool.query(`INSERT INTO proveedor (nit, nombre, direccion, celular, saldo)
                                               VALUES ($1, $2, $3, $4, $5)`,
                                               [nit, nombre, direccion, celular, saldo]);

        res.redirect('/dashboard');
    } catch (err) {
        console.error(err.message);
    }
});

router.put('/proveedor', async (req,res) => {
    try {
        const {
            codigo,
            nit,
            nombre,
            apellido,
            direccion,
            celular,
            saldo
        } = req.body;

        const updateProveedor = pool.query(`UPDATE cliente 
                                            SET nit = $2, nombre = $3, apellido = $4, direccion = $5, celular = $6, saldo = $7
                                            WHERE codigo = $1`,
                                            [codigo, nit, nombre, apellido, direccion, celular, saldo]);
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err.message);
    }
});

/* Ubicación */
// Nueva Ubicación
router.get('/nueva-ubicacion', (req,res) => {
    res.render(`${folder}/ubicacion/nuevaUbicacion`);
});
// Editar Ubicación
router.get('/editar-ubicacion', (req,res) => {
    res.render(`${folder}/ubicacion/editarUbicacion`);
});

router.get('/ubicacion', async (req,res) => {
    try {
        const ubicaciones = await pool.query(`SELECT * FROM ubicacion`);
        res.json(ubicaciones.rows);
    } catch (err) {
        console.error(err.message);
    }
});

router.get('/ubicacion/:codigo', async (req,res) => {
    try {
        const { codigo } = req.params;
        const specificUbicacion = await pool.query(`SELECT * FROM ubicacion
                                                    WHERE codigo = $1`,
                                                    [codigo]);
        res.json(specificUbicacion.rows[0]);
    } catch (err) {
        console.error(err.message);
    }
});

router.put('/ubicacion', async (req,res) => {
    try {
        const {
            codigo,
            ubicacion
        } = req.body;

        const updateUbicacion = await pool.query(`UPDATE ubicacion
                                                  SET ubicacion = $2
                                                  WHERE codigo = $1`,
                                                  [codigo, ubicacion]);
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err.message);
    }
});

router.post('/ubicacion', async (req,res) => {
    try {
        const {
            codigo,
            ubicacion
        } = req.body;

        const newUbicacion = await pool.query(`INSERT INTO ubicacion (codigo, ubicacion)
                                               VALUES ($1, $2)`,
                                               [codigo, ubicacion]);
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err.message);
    }
});

/* Tipo de Gastos */
// Nuevo Gasto
router.get('/nuevo-gasto', (req,res) => {
    res.render(`${folder}/tipo-de-gastos/nuevoGasto`);
});
// Editar Gasto
router.get('/editar-gasto', (req,res) => {
    res.render(`${folder}/tipo-de-gastos/editarGasto`);
});

router.get('/gasto', async (req,res) => {
    try {
        const gastos = await pool.query(`SELECT * FROM gasto`);
        res.json(gastos.rows);
    } catch (err) {
        console.error(err.message);
    }
});

router.get('/gasto/:codigo', async (req,res) => {
    try {
        const { codigo } = req.params;
        const specificGasto = await pool.query(`SELECT * FROM gasto
                                                WHERE codigo = $1`,
                                                [codigo]);
        res.json(specificGasto.rows[0]);
    } catch (err) {
        console.error(err.message);
    }
});

router.put('/gasto', async (req,res) => {
    try {
        const {
            codigo,
            tipoDeGasto
        } = req.body;

        const updateGasto = await pool.query(`UPDATE gasto
                                              SET tipo_de_gasto = $2
                                              WHERE codigo = $1`,
                                              [codigo, tipoDeGasto]);
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err.message);
    }
});

router.post('/gasto', async (req,res) => {
    try {
        const {
            codigo,
            tipoDeGasto
        } = req.body;

        const newGasto = await pool.query(`INSERT INTO gasto (codigo, tipo_de_gasto)
                                           VALUES ($1, $2)`,
                                           [codigo, tipoDeGasto]);
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err.message);
    }
});

module.exports = router;