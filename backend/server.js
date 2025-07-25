// backend/server.js
const express = require('express');
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const path = require('node:path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001; // Usa la variable de entorno para el puerto en producción (ej. para un proceso manager como PM2), o 3001 por defecto
const HOST = '0.0.0.0'; // Escuchar en todas las interfaces de red

// --- Configuración de Middleware ---
// Configuración de CORS para PRODUCCIÓN:
// Especifica tus dominios exactos.
// 'https://pages.elhubdeseguridad.com' es el origen de tu frontend en producción.
// Mantenemos los orígenes de desarrollo para facilitar pruebas locales si es necesario.
const allowedOrigins = [
  'http://localhost:3000', // Para tu desarrollo local de Next.js
  'http://192.168.120.99:3000', // Para tu desarrollo móvil en red local
  'https://pages.elhubdeseguridad.com', // ¡IMPORTANTE! El dominio de tu frontend en PRODUCCIÓN
];

const corsOptions = {
  origin: function (origin, callback) {
    // Permite solicitudes sin origen (ej. Postman, o peticiones de mismo origen si el backend está en el mismo subdominio)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      const msg = `La política de CORS para este sitio no permite el acceso desde el origen ${origin}.`;
      callback(new Error(msg), false);
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204 // Para pre-flight requests (peticiones OPTIONS)
};

app.use(cors(corsOptions));
app.use(express.json());

// --- Configuración de la Base de Datos LowDB ---
// Ajusta la ruta si 'database.json' no estará en el mismo directorio que 'server.js' en producción
const file = path.join(__dirname, 'database.json');
const adapter = new JSONFile(file);
const db = new Low(adapter, { courses: [], priceRanges: [] });

// Función asíncrona para cargar los datos de la base de datos
async function initializeDb() {
    await db.read();
    db.data = db.data || { courses: [], priceRanges: [] };
    await db.write();
    console.log('Base de datos LowDB inicializada y lista.');

    if (db.data.priceRanges.length === 0) {
        db.data.priceRanges.push(
            { minUsers: 1, maxUsers: 99, pricePerLicense: 1.00 },
            { minUsers: 100, maxUsers: 499, pricePerLicense: 0.90 },
            { minUsers: 500, maxUsers: 999, pricePerLicense: 0.80 },
            { minUsers: 1000, maxUsers: 4999, pricePerLicense: 0.70 },
            { minUsers: 5000, maxUsers: 9999, pricePerLicense: 0.60 },
            { minUsers: 10000, maxUsers: null, pricePerLicense: 0.50 }
        );
        await db.write();
        console.log('Rangos de precios por defecto añadidos a la base de datos.');
    }
}

initializeDb();


// --- Rutas de la API para Cursos (Administrador) ---

// Añadir un nuevo curso
app.post('/api/courses', async (req, res) => {
    const { name, price } = req.body;
    if (!name || typeof price === 'undefined' || isNaN(parseFloat(price))) {
        return res.status(400).json({ error: 'Nombre y precio (numérico) del curso son requeridos.' });
    }
    const newCourse = { id: Date.now(), name, price: parseFloat(price) };
    db.data.courses.push(newCourse);
    await db.write();
    res.status(201).json(newCourse);
});

// Obtener todos los cursos
app.get('/api/courses', async (req, res) => {
    await db.read();
    res.json(db.data.courses);
});

// Actualizar un curso existente
app.put('/api/courses/:id', async (req, res) => {
    const { id } = req.params;
    const { name, price } = req.body;
    if (!name && typeof price === 'undefined') {
        return res.status(400).json({ error: 'Se requiere al menos un nombre o un precio para actualizar.' });
    }
    await db.read();
    const courseIndex = db.data.courses.findIndex(c => c.id === parseInt(id));
    if (courseIndex === -1) {
        return res.status(404).json({ error: 'Curso no encontrado.' });
    }
    if (name) {
        db.data.courses[courseIndex].name = name;
    }
    if (typeof price !== 'undefined') {
        db.data.courses[courseIndex].price = parseFloat(price);
    }
    await db.write();
    res.json(db.data.courses[courseIndex]);
});

// Eliminar un curso
app.delete('/api/courses/:id', async (req, res) => {
    const { id } = req.params;
    await db.read();
    const initialLength = db.data.courses.length;
    db.data.courses = db.data.courses.filter(c => c.id !== parseInt(id));
    if (db.data.courses.length === initialLength) {
        return res.status(404).json({ error: 'Curso no encontrado.' });
    }
    await db.write();
    res.status(200).json({ message: 'Curso eliminado con éxito.' });
});

// --- Rutas de la API para la Tabla de Escalado de Usuarios (Administrador) ---

// Configurar rangos de precios (sobrescribe los existentes)
app.post('/api/price-ranges', async (req, res) => {
    const { ranges } = req.body;
    if (!Array.isArray(ranges) || ranges.some(r => typeof r.minUsers !== 'number' || typeof r.pricePerLicense !== 'number')) {
        return res.status(400).json({ error: 'Formato de rangos inválido. Se espera un array de objetos con minUsers, maxUsers (opcional) y pricePerLicense.' });
    }
    db.data.priceRanges = ranges.map(range => ({
        minUsers: parseInt(range.minUsers),
        maxUsers: range.maxUsers ? parseInt(range.maxUsers) : null,
        pricePerLicense: parseFloat(range.pricePerLicense)
    }));
    await db.write();
    res.status(200).json({ message: 'Rangos de precios actualizados.' });
});

// Obtener rangos de precios
app.get('/api/price-ranges', async (req, res) => {
    await db.read();
    res.json(db.data.priceRanges);
});


// --- Ruta de la API para Calcular Precios (Vendedor) ---
app.post('/api/calculate-price', async (req, res) => {
    const { quotationItems } = req.body;

    if (!Array.isArray(quotationItems) || quotationItems.length === 0) {
        return res.status(400).json({ error: 'Se requiere una lista de ítems de cotización válida.' });
    }
    await db.read();

    let totalSubtotal = 0;
    let totalLicenciasGlobal = 0;

    for (const item of quotationItems) {
        const { courseId, users } = item;

        if (typeof users !== 'number' || users <= 0 || !courseId) {
            return res.status(400).json({ error: `Ítem de cotización inválido: courseId ${courseId}, users ${users}.` });
        }

        const selectedCourse = db.data.courses.find(c => c.id === parseInt(courseId));
        if (!selectedCourse) {
            return res.status(404).json({ error: `Curso con ID ${courseId} no encontrado.` });
        }
        const baseCoursePrice = selectedCourse.price;

        const licenciasPorItem = users;
        totalLicenciasGlobal += licenciasPorItem;

        let pricePerLicenseFromRange = 0;
        const foundRange = db.data.priceRanges.find(range =>
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
});

// --- Inicio del Servidor ---
app.listen(port, HOST, () => {
    console.log(`Backend de la calculadora ejecutándose en http://${HOST}:${port}`);
    console.log(`Para producción, se espera que el frontend acceda a ${process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL}/api/...`);
});