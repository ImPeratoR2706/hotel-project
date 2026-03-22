const express = require('express');
const { nanoid } = require('nanoid');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const port = 3000;
const JWT_SECRET = "hotel_secret_key_2025";
const ACCESS_EXPIRES_IN = "15m";

app.use(cors({
    origin: "http://localhost:3001",
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

app.use((req, res, next) => {
    res.on('finish', () => {
        console.log(`[${new Date().toISOString()}][${req.method}] ${res.statusCode} ${req.path}`);
        if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
            console.log('Body:', req.body);
        }
    });
    next();
});

let users = [];
let rooms = [
    { id: nanoid(6), name: 'Standard', category: 'Economy', description: 'Уютный номер', price: 5000, capacity: 2, isAvailable: true },
    { id: nanoid(6), name: 'Comfort', category: 'Standard', description: 'Номер с завтраком', price: 7500, capacity: 2, isAvailable: true },
    { id: nanoid(6), name: 'Deluxe', category: 'Premium', description: 'Вид на город', price: 12000, capacity: 3, isAvailable: false },
    { id: nanoid(6), name: 'Suite', category: 'Premium', description: 'Двухкомнатный', price: 25000, capacity: 4, isAvailable: true },
    { id: nanoid(6), name: 'Presidential', category: 'Luxury', description: 'Панорамные окна', price: 50000, capacity: 6, isAvailable: true },
    { id: nanoid(6), name: 'Family', category: 'Standard', description: 'Для семьи', price: 15000, capacity: 5, isAvailable: true },
    { id: nanoid(6), name: 'Single', category: 'Economy', description: 'Для одного', price: 3000, capacity: 1, isAvailable: true },
    { id: nanoid(6), name: 'Double', category: 'Standard', description: 'Двуспальная кровать', price: 6000, capacity: 2, isAvailable: false },
    { id: nanoid(6), name: 'Twin', category: 'Standard', description: 'Две кровати', price: 6500, capacity: 2, isAvailable: true },
    { id: nanoid(6), name: 'Studio', category: 'Premium', description: 'С кухней', price: 9000, capacity: 2, isAvailable: true }
];

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Hotel Management API',
            version: '1.0.0',
            description: 'API для управления номерами отеля и пользователями',
        },
        servers: [
            {
                url: `http://localhost:${port}`,
                description: 'Локальный сервер',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    apis: ['./index.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

async function hashPassword(password) {
    const rounds = 10;
    return bcrypt.hash(password, rounds);
}

async function verifyPassword(password, passwordHash) {
    return bcrypt.compare(password, passwordHash);
}

function generateAccessToken(user) {
    return jwt.sign(
        { sub: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name },
        JWT_SECRET,
        { expiresIn: ACCESS_EXPIRES_IN }
    );
}

function authMiddleware(req, res, next) {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");
    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({ error: "Missing or invalid Authorization header" });
    }
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = payload;
        next();
    } catch (err) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
}

function findUserOr404(email, res) {
    const user = users.find(u => u.email == email);
    if (!user) {
        res.status(404).json({ error: "User not found" });
        return null;
    }
    return user;
}

function findRoomOr404(id, res) {
    const room = rooms.find(r => r.id == id);
    if (!room) {
        res.status(404).json({ error: "Room not found" });
        return null;
    }
    return room;
}

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Регистрация пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - first_name
 *               - last_name
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Пользователь создан
 */
app.post('/api/auth/register', async (req, res) => {
    const { email, first_name, last_name, password } = req.body;
    if (!email || !password || !first_name || !last_name) {
        return res.status(400).json({ error: "All fields are required" });
    }
    const exists = users.some(u => u.email === email);
    if (exists) {
        return res.status(409).json({ error: "Email already exists" });
    }
    const hashedPassword = await hashPassword(password);
    const newUser = {
        id: nanoid(6),
        email,
        first_name,
        last_name,
        password: hashedPassword
    };
    users.push(newUser);
    res.status(201).json({ id: newUser.id, email: newUser.email, first_name: newUser.first_name, last_name: newUser.last_name });
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Вход в систему
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Успешный вход
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 user:
 *                   type: object
 */
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }
    const user = findUserOr404(email, res);
    if (!user) return;
    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials" });
    }
    const accessToken = generateAccessToken(user);
    res.status(200).json({ accessToken, user: { id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name } });
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Получить текущего пользователя
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Данные пользователя
 *       401:
 *         description: Неавторизован
 */
app.get('/api/auth/me', authMiddleware, (req, res) => {
    const user = users.find(u => u.id === req.user.sub);
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    res.json({ id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name });
});

app.get('/', (req, res) => {
    res.send('Hotel API Server');
});

/**
 * @swagger
 * /api/rooms:
 *   get:
 *     summary: Получить список номеров
 *     tags: [Rooms]
 *     responses:
 *       200:
 *         description: Список номеров
 */
app.get('/api/rooms', (req, res) => {
    res.json(rooms);
});

/**
 * @swagger
 * /api/rooms/{id}:
 *   get:
 *     summary: Получить номер по ID
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Данные номера
 *       401:
 *         description: Неавторизован
 */
app.get('/api/rooms/:id', authMiddleware, (req, res) => {
    const id = req.params.id;
    const room = findRoomOr404(id, res);
    if (!room) return;
    res.json(room);
});

/**
 * @swagger
 * /api/rooms:
 *   post:
 *     summary: Создать номер
 *     tags: [Rooms]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Номер создан
 */
app.post('/api/rooms', (req, res) => {
    const { name, category, description, price, capacity, isAvailable } = req.body;
    const newRoom = {
        id: nanoid(6),
        name: name.trim(),
        category: category.trim(),
        description: description.trim(),
        price: Number(price),
        capacity: Number(capacity),
        isAvailable: Boolean(isAvailable)
    };
    rooms.push(newRoom);
    res.status(201).json(newRoom);
});

/**
 * @swagger
 * /api/rooms/{id}:
 *   put:
 *     summary: Обновить номер
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Номер обновлен
 *       401:
 *         description: Неавторизован
 */
app.put('/api/rooms/:id', authMiddleware, (req, res) => {
    const id = req.params.id;
    const room = findRoomOr404(id, res);
    if (!room) return;
    const { name, category, description, price, capacity, isAvailable } = req.body;
    if (name !== undefined) room.name = name.trim();
    if (category !== undefined) room.category = category.trim();
    if (description !== undefined) room.description = description.trim();
    if (price !== undefined) room.price = Number(price);
    if (capacity !== undefined) room.capacity = Number(capacity);
    if (isAvailable !== undefined) room.isAvailable = Boolean(isAvailable);
    res.json(room);
});

/**
 * @swagger
 * /api/rooms/{id}:
 *   delete:
 *     summary: Удалить номер
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       204:
 *         description: Номер удален
 *       401:
 *         description: Неавторизован
 */
app.delete('/api/rooms/:id', authMiddleware, (req, res) => {
    const id = req.params.id;
    const exists = rooms.some(r => r.id === id);
    if (!exists) return res.status(404).json({ error: "Room not found" });
    rooms = rooms.filter(r => r.id !== id);
    res.status(204).send();
});

app.use((req, res) => {
    res.status(404).json({ error: "Not found" });
});

app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
    console.log(`Swagger UI available at http://localhost:${port}/api-docs`);
});