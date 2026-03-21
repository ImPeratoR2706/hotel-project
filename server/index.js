const express = require('express');
const { nanoid } = require('nanoid');

const app = express();
const port = 3000;

let rooms = [
    { id: nanoid(6), name: 'Standard', price: 5000, capacity: 2, isAvailable: true },
    { id: nanoid(6), name: 'Comfort', price: 7500, capacity: 2, isAvailable: true },
    { id: nanoid(6), name: 'Deluxe', price: 12000, capacity: 3, isAvailable: false },
    { id: nanoid(6), name: 'Suite', price: 25000, capacity: 4, isAvailable: true },
    { id: nanoid(6), name: 'Presidential', price: 50000, capacity: 6, isAvailable: true },
    { id: nanoid(6), name: 'Family', price: 15000, capacity: 5, isAvailable: true },
    { id: nanoid(6), name: 'Single', price: 3000, capacity: 1, isAvailable: true },
    { id: nanoid(6), name: 'Double', price: 6000, capacity: 2, isAvailable: false },
    { id: nanoid(6), name: 'Twin', price: 6500, capacity: 2, isAvailable: true },
    { id: nanoid(6), name: 'Studio', price: 9000, capacity: 2, isAvailable: true }
];

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

app.get('/api/rooms', (req, res) => {
    res.json(rooms);
});

app.get('/api/rooms/:id', (req, res) => {
    const id = req.params.id;
    const room = findRoomOr404(id, res);
    if (!room) return;
    res.json(room);
});

app.post('/api/rooms', (req, res) => {
    const { name, price, capacity, isAvailable } = req.body;
    const newRoom = {
        id: nanoid(6),
        name: name.trim(),
        price: Number(price),
        capacity: Number(capacity),
        isAvailable: Boolean(isAvailable)
    };
    rooms.push(newRoom);
    res.status(201).json(newRoom);
});

app.patch('/api/rooms/:id', (req, res) => {
    const id = req.params.id;
    const room = findRoomOr404(id, res);
    if (!room) return;

    if (req.body?.name === undefined && req.body?.price === undefined && req.body?.capacity === undefined) {
        return res.status(400).json({ error: "Nothing to update" });
    }

    const { name, price, capacity, isAvailable } = req.body;

    if (name !== undefined) room.name = name.trim();
    if (price !== undefined) room.price = Number(price);
    if (capacity !== undefined) room.capacity = Number(capacity);
    if (isAvailable !== undefined) room.isAvailable = Boolean(isAvailable);

    res.json(room);
});

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
});