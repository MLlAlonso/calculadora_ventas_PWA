const express = require('express');
const cors = require('cors');
const { Pool } = require('pg'); // Importa el Pool de pg para gestionar conexiones

const app = express();
const port = process.env.PORT || 3001;
const HOST = '0.0.0.0';

// --- Configuración de PostgreSQL ---
// Render inyectará esta variable de entorno automáticamente
const DATABASE_URL = process.env.DATABASE_URL;

// Asegúrate de que la URL de la base de datos esté definida
if (!DATABASE_URL) {
    console.error('ERROR: La variable de entorno DATABASE_URL no está definida.');
    console.error('Asegúrate de configurarla en Render con la External Database URL de tu PostgreSQL.');
    process.exit(1);
}

// Configuración del Pool de conexiones para PostgreSQL
const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // NECESARIO para conexiones desde Render a PostgreSQL de Render si se usa SSL
    }
});

// --- Configuración de Middleware ---
const allowedOrigins = [
    'http://localhost:3000',
    'http://192.168.120.99:3000',
    'https://calculapp.onrender.com', // ¡ESTA ES LA LÍNEA QUE DEBES AÑADIR/MODIFICAR!
    // Si tu URL de frontend en Render es diferente (ej. https://calculapp-frontend.onrender.com),
    // cámbiala por la URL exacta que Render te da para tu frontend.
    'https://pages.elhubdeseguridad.com', // Mantén si lo usas en otro contexto, si no, puedes eliminarlo
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            const msg = `La política de CORS para este sitio no permite el acceso desde el origen ${origin}.`;
            callback(new Error(msg), false);
        }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(express.json());

// --- Función para inicializar la base de datos (crear tablas si no existen) ---
async function initializeDb() {
    let client;
    try {
        client = await pool.connect(); // Obtiene una conexión del pool

        // Crear tabla 'courses'
        // Usamos SERIAL PRIMARY KEY para que los IDs se autoincrementen
        await client.query(`
            CREATE TABLE IF NOT EXISTS courses (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                price NUMERIC(10, 2) NOT NULL
            );
        `);
        console.log('Tabla "courses" verificada/creada.');

        // Crear tabla 'price_ranges'
        await client.query(`
            CREATE TABLE IF NOT EXISTS price_ranges (
                id SERIAL PRIMARY KEY,
                min_users INTEGER NOT NULL,
                max_users INTEGER,
                price_per_license NUMERIC(10, 2) NOT NULL
            );
        `);
        console.log('Tabla "price_ranges" verificada/creada.');

        // Insertar rangos de precios por defecto si la tabla está vacía
        const res = await client.query('SELECT COUNT(*) FROM price_ranges;');
        if (parseInt(res.rows[0].count) === 0) {
            await client.query(`
                INSERT INTO price_ranges (min_users, max_users, price_per_license) VALUES
                (1, 99, 1.00),
                (100, 499, 0.90),
                (500, 999, 0.80),
                (1000, 4999, 0.70),
                (5000, 9999, 0.60),
                (10000, NULL, 0.50);
            `);
            console.log('Rangos de precios por defecto añadidos a la base de datos.');
        }

        console.log('Base de datos PostgreSQL inicializada y lista.');

    } catch (error) {
        console.error('Error al inicializar la base de datos:', error);
        process.exit(1); // Sale si hay un error crítico al iniciar la DB
    } finally {
        if (client) client.release(); // Asegura que la conexión se libere incluso si hay un error
    }
}

// --- Rutas de la API para Cursos (Administrador) ---

// Añadir un nuevo curso
app.post('/api/courses', async (req, res) => {
    const { name, price } = req.body;
    if (!name || typeof price === 'undefined' || isNaN(parseFloat(price))) {
        return res.status(400).json({ error: 'Nombre y precio (numérico) del curso son requeridos.' });
    }
    try {
        const result = await pool.query(
            'INSERT INTO courses (name, price) VALUES ($1, $2) RETURNING id, name, price;',
            [name, parseFloat(price)]
        );
        res.status(201).json(result.rows[0]); // Retorna el nuevo curso con el ID generado
    } catch (error) {
        console.error('Error al añadir curso:', error);
        res.status(500).json({ error: 'Error interno del servidor al añadir curso.' });
    }
});

// Obtener todos los cursos
app.get('/api/courses', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name, price FROM courses ORDER BY id;');
        // Mapeamos para asegurar que 'price' sea un número y los nombres de las columnas sean como antes
        res.json(result.rows.map(row => ({
            id: row.id,
            name: row.name,
            price: parseFloat(row.price)
        })));
    } catch (error) {
        console.error('Error al obtener cursos:', error);
        res.status(500).json({ error: 'Error interno del servidor al obtener cursos.' });
    }
});

// Actualizar un curso existente
app.put('/api/courses/:id', async (req, res) => {
    const { id } = req.params;
    const { name, price } = req.body;
    if (!name && typeof price === 'undefined') {
        return res.status(400).json({ error: 'Se requiere al menos un nombre o un precio para actualizar.' });
    }
    try {
        let updateQuery = 'UPDATE courses SET ';
        const updateValues = [];
        const queryParams = [];
        let paramIndex = 1;

        if (name) {
            updateValues.push(`name = $${paramIndex++}`);
            queryParams.push(name);
        }
        if (typeof price !== 'undefined') {
            updateValues.push(`price = $${paramIndex++}`);
            queryParams.push(parseFloat(price));
        }

        if (updateValues.length === 0) { // Esto ya debería ser atrapado por la validación inicial
             return res.status(400).json({ error: 'Se requiere al menos un nombre o un precio para actualizar.' });
        }

        updateQuery += updateValues.join(', ') + ` WHERE id = $${paramIndex} RETURNING id, name, price;`;
        queryParams.push(parseInt(id));

        const result = await pool.query(updateQuery, queryParams);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Curso no encontrado.' });
        }
        res.json({ // Asegura que 'price' sea un número
            id: result.rows[0].id,
            name: result.rows[0].name,
            price: parseFloat(result.rows[0].price)
        });
    } catch (error) {
        console.error('Error al actualizar curso:', error);
        res.status(500).json({ error: 'Error interno del servidor al actualizar curso.' });
    }
});

// Eliminar un curso
app.delete('/api/courses/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM courses WHERE id = $1 RETURNING id;', [parseInt(id)]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Curso no encontrado.' });
        }
        res.status(200).json({ message: 'Curso eliminado con éxito.' });
    } catch (error) {
        console.error('Error al eliminar curso:', error);
        res.status(500).json({ error: 'Error interno del servidor al eliminar curso.' });
    }
});

// --- Rutas de la API para la Tabla de Escalado de Usuarios (Administrador) ---

// Configurar rangos de precios (sobrescribe los existentes)
app.post('/api/price-ranges', async (req, res) => {
    const { ranges } = req.body;
    if (!Array.isArray(ranges) || ranges.some(r => typeof r.minUsers !== 'number' || typeof r.pricePerLicense !== 'number')) {
        return res.status(400).json({ error: 'Formato de rangos inválido. Se espera un array de objetos con minUsers, maxUsers (opcional) y pricePerLicense.' });
    }
    try {
        await pool.query('DELETE FROM price_ranges;'); // Elimina los existentes
        const insertPromises = ranges.map(range =>
            pool.query(
                'INSERT INTO price_ranges (min_users, max_users, price_per_license) VALUES ($1, $2, $3);',
                [parseInt(range.minUsers), range.maxUsers ? parseInt(range.maxUsers) : null, parseFloat(range.pricePerLicense)]
            )
        );
        await Promise.all(insertPromises);
        res.status(200).json({ message: 'Rangos de precios actualizados.' });
    } catch (error) {
        console.error('Error al actualizar rangos de precios:', error);
        res.status(500).json({ error: 'Error interno del servidor al actualizar rangos de precios.' });
    }
});

// Obtener rangos de precios
app.get('/api/price-ranges', async (req, res) => {
    try {
        const result = await pool.query('SELECT min_users, max_users, price_per_license FROM price_ranges ORDER BY min_users;');
        // Mapea los resultados para que coincidan con la estructura esperada por el frontend
        // (PostgreSQL devuelve nombres de columna en snake_case por defecto, y NUMERIC como string)
        res.json(result.rows.map(row => ({
            minUsers: row.min_users,
            maxUsers: row.max_users,
            pricePerLicense: parseFloat(row.price_per_license)
        })));
    } catch (error) {
        console.error('Error al obtener rangos de precios:', error);
        res.status(500).json({ error: 'Error interno del servidor al obtener rangos de precios.' });
    }
});


// --- Ruta de la API para Calcular Precios (Vendedor) ---
app.post('/api/calculate-price', async (req, res) => {
    const { quotationItems } = req.body;

    if (!Array.isArray(quotationItems) || quotationItems.length === 0) {
        return res.status(400).json({ error: 'Se requiere una lista de ítems de cotización válida.' });
    }

    try {
        const coursesResult = await pool.query('SELECT id, name, price FROM courses;');
        const courses = coursesResult.rows.map(row => ({
            id: row.id,
            name: row.name,
            price: parseFloat(row.price)
        })); // Asegura que price sea numérico

        const priceRangesResult = await pool.query('SELECT min_users, max_users, price_per_license FROM price_ranges;');
        const priceRanges = priceRangesResult.rows.map(row => ({
            minUsers: row.min_users,
            maxUsers: row.max_users,
            pricePerLicense: parseFloat(row.price_per_license)
        }));

        let totalSubtotal = 0;
        let totalLicenciasGlobal = 0;

        for (const item of quotationItems) {
            const { courseId, users } = item;

            if (typeof users !== 'number' || users <= 0 || !courseId) {
                return res.status(400).json({ error: `Ítem de cotización inválido: courseId ${courseId}, users ${users}.` });
            }

            const selectedCourse = courses.find(c => c.id === parseInt(courseId));
            if (!selectedCourse) {
                return res.status(404).json({ error: `Curso con ID ${courseId} no encontrado.` });
            }
            const baseCoursePrice = selectedCourse.price;

            const licenciasPorItem = users;
            totalLicenciasGlobal += licenciasPorItem;

            let pricePerLicenseFromRange = 0;
            const foundRange = priceRanges.find(range =>
                licenciasPorItem >= range.minUsers && (range.maxUsers === null || licenciasPorItem <= range.maxUsers)
            );

            if (foundRange) {
                pricePerLicenseFromRange = foundRange.pricePerLicense;
            } else {
                pricePerLicenseFromRange = 1.00;
                console.warn(`No se encontró un rango de precios aplicable para ${licenciasPorItem} licencias en curso ID ${courseId}. Usando precio de respaldo: ${pricePerLicenseFromRange}`);
            }

            totalSubtotal += baseCoursePrice * licenciasPorItem * pricePerLicenseFromRange;
        }

        let descuento = 0;
        if (totalLicenciasGlobal <= 0) {
            descuento = 0;
        } else if (totalLicenciasGlobal >= 10000) {
            descuento = 0.60;
        } else {
            descuento = Math.min(Math.log10(totalLicenciasGlobal) * 0.075, 0.60);
        }

        const pvp = totalSubtotal * (1 - descuento);
        const precioUnitarioGlobal = totalLicenciasGlobal > 0 ? pvp / totalLicenciasGlobal : 0;

        res.json({
            subtotal: totalSubtotal.toFixed(2),
            descuentoAplicado: (descuento * 100).toFixed(2) + '%',
            pvp: pvp.toFixed(2),
            precioUnitario: precioUnitarioGlobal.toFixed(2)
        });

    } catch (error) {
        console.error('Error al calcular precio:', error);
        res.status(500).json({ error: 'Error interno del servidor al calcular precio.' });
    }
});


// --- Inicio del Servidor ---
async function startServer() {
    await initializeDb(); // Asegura que la DB esté lista antes de empezar a escuchar peticiones

    app.listen(port, HOST, () => {
        console.log(`Backend de la calculadora ejecutándose en http://${HOST}:${port}`);
        console.log(`Para producción, se espera que el frontend acceda a ${process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL}/api/...`);
        console.log(`Conectado a PostgreSQL: ${DATABASE_URL.split('@')[1]}`); // Muestra solo el host de la DB por seguridad
    });
}

startServer().catch(error => {
    console.error('Fallo al iniciar el servidor:', error);
    process.exit(1); // Asegura que el proceso salga si hay un error crítico al iniciar
});