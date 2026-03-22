const express = require('express');
const { nanoid } = require('nanoid');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const port = 3000;

app.use(cors({
    origin: "http://localhost:3001",
    methods: ["GET", "POST", "PATCH", "DELETE"],
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

let rooms = [
    { id: nanoid(6), name: 'Standard', category: 'Economy', description: 'Уютный номер для одного-двух гостей', price: 5000, capacity: 2, isAvailable: true },
    { id: nanoid(6), name: 'Comfort', category: 'Standard', description: 'Номер с улучшенной отделкой и завтраком', price: 7500, capacity: 2, isAvailable: true },
    { id: nanoid(6), name: 'Deluxe', category: 'Premium', description: 'Просторный номер с видом на город', price: 12000, capacity: 3, isAvailable: false },
    { id: nanoid(6), name: 'Suite', category: 'Premium', description: 'Двухкомнатный номер с гостиной', price: 25000, capacity: 4, isAvailable: true },
    { id: nanoid(6), name: 'Presidential', category: 'Luxury', description: 'Роскошный номер с панорамными окнами', price: 50000, capacity: 6, isAvailable: true },
    { id: nanoid(6), name: 'Family', category: 'Standard', description: 'Номер для семьи с детьми', price: 15000, capacity: 5, isAvailable: true },
    { id: nanoid(6), name: 'Single', category: 'Economy', description: 'Компактный номер для одного гостя', price: 3000, capacity: 1, isAvailable: true },
    { id: nanoid(6), name: 'Double', category: 'Standard', description: 'Номер с двуспальной кроватью', price: 6000, capacity: 2, isAvailable: false },
    { id: nanoid(6), name: 'Twin', category: 'Standard', description: 'Номер с двумя отдельными кроватями', price: 6500, capacity: 2, isAvailable: true },
    { id: nanoid(6), name: 'Studio', category: 'Premium', description: 'Номер-студия с кухней', price: 9000, capacity: 2, isAvailable: true }
];

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Hotel Management API',
            version: '1.0.0',
            description: 'API для управления номерами отеля',
        },
        servers: [
            {
                url: `http://localhost:${port}`,
                description: 'Локальный сервер',
            },
        ],
    },
    apis: ['./index.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * components:
 *   schemas:
 *     Room:
 *       type: object
 *       required:
 *         - name
 *         - price
 *       properties:
 *         id:
 *           type: string
 *           description: Автоматически сгенерированный уникальный ID номера
 *         name:
 *           type: string
 *           description: Название номера
 *         category:
 *           type: string
 *           description: Категория номера
 *         description:
 *           type: string
 *           description: Описание номера
 *         price:
 *           type: integer
 *           description: Цена за ночь в рублях
 *         capacity:
 *           type: integer
 *           description: Максимальная вместимость (человек)
 *         isAvailable:
 *           type: boolean
 *           description: Доступен ли номер для бронирования
 *       example:
 *         id: "abc123"
 *         name: "Люкс"
 *         category: "Premium"
 *         description: "Номер с видом на море"
 *         price: 15000
 *         capacity: 2
 *         isAvailable: true
 */

function findRoomOr404(id, res) {
    const room = rooms.find(r => r.id == id);
    if (!room) {
        res.status(404).json({ error: "Room not found" });
        return null;
    }
    return room;
}

app.get('/', (req, res) => {
    res.send('Hotel API Server');
});

/**
 * @swagger
 * /api/rooms:
 *   get:
 *     summary: Возвращает список всех номеров отеля
 *     tags: [Rooms]
 *     responses:
 *       200:
 *         description: Список номеров
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Room'
 */
app.get('/api/rooms', (req, res) => {
    res.json(rooms);
});

/**
 * @swagger
 * /api/rooms/{id}:
 *   get:
 *     summary: Получает номер отеля по ID
 *     tags: [Rooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID номера отеля
 *     responses:
 *       200:
 *         description: Данные номера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Room'
 *       404:
 *         description: Номер не найден
 */
app.get('/api/rooms/:id', (req, res) => {
    const id = req.params.id;
    const room = findRoomOr404(id, res);
    if (!room) return;
    res.json(room);
});

/**
 * @swagger
 * /api/rooms:
 *   post:
 *     summary: Создает новый номер отеля
 *     tags: [Rooms]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: integer
 *               capacity:
 *                 type: integer
 *               isAvailable:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Номер успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Room'
 *       400:
 *         description: Ошибка в теле запроса
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
 *   patch:
 *     summary: Обновляет данные номера отеля
 *     tags: [Rooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID номера отеля
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: integer
 *               capacity:
 *                 type: integer
 *               isAvailable:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Обновленный номер
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Room'
 *       400:
 *         description: Нет данных для обновления
 *       404:
 *         description: Номер не найден
 */
app.patch('/api/rooms/:id', (req, res) => {
    const id = req.params.id;
    const room = findRoomOr404(id, res);
    if (!room) return;

    if (req.body?.name === undefined && req.body?.price === undefined && req.body?.capacity === undefined) {
        return res.status(400).json({ error: "Nothing to update" });
    }

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
 *     summary: Удаляет номер отеля
 *     tags: [Rooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID номера отеля
 *     responses:
 *       204:
 *         description: Номер успешно удален
 *       404:
 *         description: Номер не найден
 */
app.delete('/api/rooms/:id', (req, res) => {
    const id = req.params.id;
    const exists = rooms.some((r) => r.id === id);
    if (!exists) return res.status(404).json({ error: "Room not found" });

    rooms = rooms.filter((r) => r.id !== id);
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