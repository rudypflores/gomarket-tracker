const { app } = require('electron');
const express = require('express');
const router = express.Router();
const pool = require('../db');
const folder = 'tabs/mantenimientos';

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
        const {
            codigo,
            nombre,
            costoQ,
            precioPublico,
            pUtilidad,
            ubicacion,
            estado
        } = req.body;

        const newProducto = await pool.query(`INSERT INTO producto (codigo, nombre, costo_q, precio_publico, p_utilidad, ubicacion, estado)
                                              VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
                                              [codigo, nombre, costoQ, precioPublico, pUtilidad, ubicacion, estado]);

        res.json({
            message:'Producto creado exitosamente!'
        });
    } catch (err) {
        console.error(err.message);
        if(err.message === 'duplicate key value violates unique constraint "producto_pkey"')
            res.json({ message:'No se pudo crear un nuevo producto porque el codigo ya existe.' });
    }
});

router.put('/producto', async (req,res) => {
    const {
        codigo,
        nombre,
        costoQ,
        pUtilidad,
        precioPublico,
        ubicacion,
        estado
    } = req.body;

    const updateProducto = await pool.query(`UPDATE producto 
                                             SET codigo = $7, nombre = $1, costo_q = $2, precio_publico = $3, p_utilidad = $4, ubicacion = $5, estado = $6
                                             WHERE codigo = $7`,
                                             [nombre, costoQ, precioPublico, pUtilidad, ubicacion, estado, codigo]);

    res.redirect('/dashboard');
});

router.delete('/producto/:codigo', async (req,res) => {
    const { codigo } = req.params;
    try {
        const deleteProducto = await pool.query(`DELETE FROM producto WHERE codigo = $1`, [codigo]);
        res.json({ message: `Producto con codigo ${codigo} borrado exitosamente!` })
    } catch (err) {
        console.error(err.message);
        res.json({ message: `No se pudo borrar producto con codigo ${codigo}` });
    }
});

// Control de Inventarios
router.get('/nuevo-inventario', (req,res) => {
    res.render('tabs/mantenimientos/inventario/nuevoInventario');
});

router.get('/editar-inventario', (req,res) => {
    res.render('tabs/mantenimientos/inventario/editarInventario');
});

router.get('/inventario/:id', async (req,res) => {
    try {
        const { id } = req.params;
        const specificInventario = await pool.query(`SELECT * FROM inventario WHERE codigo = $1 AND market_id = $2`, [id, req.user.market_id]);
        res.json(specificInventario.rows[0]);
    } catch (err) {
        console.error(err.message);
    }
});

router.get('/inventario', async (req,res) => {
    try {
        const inventarios = await pool.query(`SELECT * FROM inventario WHERE market_id = $1`, [req.user.market_id]);
        res.json(inventarios.rows);
    } catch (err) {
        console.error(err.message);
    }
});

router.post('/inventario', async (req,res) => {
    try {
        const {
            codigo,
            descripcion,
            existenciaActual
        } = req.body;

        const newInventario = await pool.query(`INSERT INTO inventario (codigo, descripcion, existencia_actual, market_id)
                                                VALUES ($1,$2,$3,$4) RETURNING *`,
                                                [codigo, descripcion, existenciaActual, req.user.market_id]);

        res.redirect('/dashboard');
    } catch (err) {
        console.error(err.message);
    }
});

router.put('/inventario', async (req,res) => {
    try {
        const {
            codigo,
            descripcion,
            cantidad,
            existenciaActual,
        } = req.body;
        const nuevaExistenciaActual = parseInt(existenciaActual,10)+parseInt(cantidad,10);
        const updateInventario = await pool.query(`UPDATE inventario
                                             SET existencia_actual = $2
                                             WHERE codigo = $1 AND market_id = $3`,
                                             [codigo, nuevaExistenciaActual, req.user.market_id]);
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err.message);
    }
});

router.delete('/inventario/:codigo', async (req,res) => {
    const { codigo } = req.params;
    try {
        const deleteInventario = await pool.query(`DELETE FROM inventario WHERE codigo = $1 AND market_id = $2`, [codigo, req.user.market_id]);
        res.json({ message: `Inventario con codigo ${codigo} borrado exitosamente!` })
    } catch (err) {
        console.error(err.message);
        res.json({ message: `Inventario con codigo ${codigo} no se ha podido borrar.` });
    }
});

/* Actualizar existencias */
router.get('/actualizar-existencias', (req,res) => {
    res.render(`${folder}/actualizarExistencias`);
});

router.put('/actualizar-existencias', async (req,res) => {
    try {
        const { 
            codigo,
            unidadesActuales,
            agregarODescontar,
            descripcion,
            fecha
        } = req.body;
        
        const nuevaExistencia = parseInt(unidadesActuales,10) + parseInt(agregarODescontar,10);
        const editarInventario = await pool.query(`UPDATE inventario
                                                   SET existencia_actual = $1
                                                   WHERE codigo = $2 AND market_id = $3
                                                   RETURNING *`, [nuevaExistencia, codigo, req.user.market_id]);

        const nuevaAltaYBaja = await pool.query(`INSERT INTO alta_y_baja (codigo, cantidad_cambio, razon, fecha, market_id)
                                                 VALUES ($1,$2,$3,$4,$5) RETURNING *`, [codigo, agregarODescontar, descripcion, fecha, req.user.market_id]);

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
        const proveedores = await pool.query(`SELECT * FROM proveedor WHERE market_id = $1`, [req.user.market_id]);
        res.json(proveedores.rows);
    } catch (err) {
        console.error(err.message);
    }
});

router.get('/proveedor/:codigo', async (req,res) => {
    try {
        const { codigo } = req.params;
        const specificProveedor = await pool.query(`SELECT * FROM proveedor
                                                    WHERE codigo = $1 AND market_id = $2`,
                                                    [codigo, req.user.market_id]);
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

        const newProveedor = await pool.query(`INSERT INTO proveedor (nit, nombre, direccion, celular, saldo, market_id)
                                               VALUES ($1, $2, $3, $4, $5, $6)`,
                                               [nit, nombre, direccion, celular, saldo, req.user.market_id]);

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
            direccion,
            celular,
            saldo,
            marketId
        } = req.body;

        console.log(req.body);

        const updateProveedor = await pool.query(`UPDATE proveedor 
                                                  SET nit = $1, nombre = $2, direccion = $3, celular = $4, saldo = $5, market_id = $6
                                                  WHERE codigo = $7 AND market_id = $6`,
                                                  [nit, nombre, direccion, celular, saldo, marketId, codigo]);
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err.message);
    }
});

router.delete('/proveedor/:codigo', async (req,res) => {
    const { codigo } = req.params;
    try {
        const deleteProveedor = await pool.query(`DELETE FROM proveedor WHERE codigo = $1 AND market_id = $2`, [codigo, req.user.market_id]);
        res.json({ message: `Proveedor borrado exitosamente!` })
    } catch (err) {
        console.error(err.message);
        res.json({ message: `Proveedor no se ha podido borrar.` })
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
            ubicacion
        } = req.body;

        const newUbicacion = await pool.query(`INSERT INTO ubicacion (ubicacion)
                                               VALUES ($1)`,
                                               [ubicacion]);
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err.message);
    }
});

router.delete('/ubicacion/:codigo', async (req,res) => {
    const { codigo } = req.params;
    try {
        const deleteUbicacion = await pool.query(`DELETE FROM ubicacion WHERE codigo = $1`, [codigo]);
        res.json({ message: `Ubicacion borrado exitosamente!` })
    } catch (err) {
        console.error(err.message);
        res.json({ message: `Ubicacion no se ha podido borrar.` })
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

/* Markets */
router.get('/nuevo-market', (req,res) => {
    res.render(`${folder}/markets/nuevoMarket`);
});

router.get('/editar-market', (req,res) => {
    res.render(`${folder}/markets/editarMarket`);
});

router.get('/market-current', (req,res) => {
    res.json(req.user);
});

router.get('/market', async (req,res) => {
    try {
        const markets = await pool.query(`SELECT * FROM market`);
        res.json(markets.rows);
    } catch (err) {
        console.error(err.message);
    }
});

router.get('/market/:id', async (req,res) => {
    try {
        const { id } = req.params;
        const findMarket = await pool.query(`SELECT * FROM market WHERE id = $1`, [id]);
        res.json(findMarket.rows[0]);
    } catch (err) {
        console.error(err.message);
    }
});

router.post('/market', async (req,res) => {
    try {
        const { marketId } = req.body;
        const newMarket = await pool.query(`INSERT INTO market (market_id) VALUES ($1)`, [marketId]);
        res.redirect('/dashboard');
    } catch (err) { 
        console.error(err.message);
    }
});

router.put('/market', async (req,res) => {
    try {
        const { codigo, marketId } = req.body;
        const updateMarket = await pool.query(`UPDATE market SET market_id = $1 WHERE id = $2`, [marketId, codigo]);
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err.message);
    }
});

router.delete('/market/:id', async (req,res) => {
    try {
        const { id } = req.params;
        const deleteMarket = await pool.query(`DELETE FROM market WHERE id = $1`, [id]);
        res.json({ message: 'Market ha sido removido.' });
    } catch (err) {
        console.error(err.message);
    }
});


/* Turnos */
router.get('/nuevo-turno', (req,res) => {
    res.render(`${folder}/turnos/nuevoTurno`);
});

router.get('/editar-turno', (req,res) => {
    res.render(`${folder}/turnos/editarTurno`);
});

router.get('/turno', async (req,res) => {
    try {
        const markets = await pool.query(`SELECT * FROM turno WHERE market_id = $1`, [req.user.market_id]);
        res.json(markets.rows);
    } catch (err) {
        console.error(err.message);
    }
});

router.get('/turno/:id', async (req,res) => {
    try {
        const { id } = req.params;
        const findMarket = await pool.query(`SELECT * FROM turno WHERE no_turno = $1`, [id]);
        res.json(findMarket.rows[0]);
    } catch (err) {
        console.error(err.message);
    }
});

router.post('/turno', async (req,res) => {
    try {
        const {
            nUsuario,
            efectivoApertura,
            efectivoCierre, 
            fechaApertura,
            fechaCierre,
            marketId
        } = req.body;
        const newTurno = await pool.query(`INSERT INTO turno (n_usuario, efectivo_apertura, efectivo_cierre, fecha_apertura, fecha_cierre, market_id)
                                           VALUES ($1,$2,$3,$4,$5,$6)`,
                                           [nUsuario, efectivoApertura, efectivoCierre, fechaApertura, fechaCierre, marketId]);
        res.redirect('/dashboard');
    } catch (err) { 
        console.error(err.message);
    }
});

router.put('/turno', async (req,res) => {
    try {
        const {
            codigo,
            nUsuario,
            efectivoApertura,
            efectivoCierre, 
            fechaApertura,
            fechaCierre
        } = req.body;
        const updateTurno = await pool.query(`UPDATE turno
                                              SET n_usuario = $1, efectivo_apertura = $2, efectivo_cierre = $3, fecha_apertura = $4, fecha_cierre = $5 
                                              WHERE no_turno = $6`,
                                              [nUsuario, efectivoApertura, efectivoCierre, fechaApertura, fechaCierre, codigo]);
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err.message);
    }
});

router.delete('/turno/:id', async (req,res) => {
    try {
        const { id } = req.params;
        const deleteTurno = await pool.query(`DELETE FROM turno WHERE no_turno = $1`, [id]);
        res.json({ message: 'Turno ha sido removido.' });
    } catch (err) {
        console.error(err.message);
    }
});

module.exports = router;