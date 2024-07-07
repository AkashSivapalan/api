const express = require('express');
require('dotenv').config();
const cors = require('cors');
const mongoose = require("mongoose");
const path = require("path");
const session = require('express-session');
const MongoStore = require('connect-mongo');
const Transaction = require('./models/transactions.js');
const User = require('./models/user.js');

const app = express();

app.use(cors({
    origin: '*', // Allow all origins
    credentials: true,
}));
app.use(express.json());

app.use(session({
    secret: 'secret123', // change this to a strong secret in production
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URL
    }),
    cookie: { secure: false } // set secure: true if using https
}));

app.get('/api/test', (req, res) => {
    console.log('hello');
    res.json({ body: 'test ok' });
});

app.post('/api/login', async (req, res) => {
    await mongoose.connect(process.env.MONGO_URL);
    const user = await User.findOne({
        email: req.body.email,
        password: req.body.password,
    });

    if (user) {
        req.session.user = {
            name: user.name,
            email: user.email,
        };
        return res.json({status:'ok', user: req.session.user});
    } else {
        return res.json({status:'error', user: false});
    }
});

app.post('/api/register', async (req, res) => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({ status: 'error', error: 'Email already exists' });
        }
        const user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
        });
        res.status(201).json({ status: 'ok', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', error: 'Internal Server Error' });
    }
});


app.post('/api/transaction', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({status: 'error', message: 'Unauthorized'});
    }

    await mongoose.connect(process.env.MONGO_URL);
    const { name, description, datetime, price, email } = req.body;

    const transaction = await Transaction.create({ name, price, description, datetime, email });
    res.json(transaction);
});

app.get('/api/transactions/:email', async (req, res) => {
    const {email} = req.params
    if (!req.session.user) {
        return res.status(401).json({status: 'error', message: 'Unauthorized'});
    }

    await mongoose.connect(process.env.MONGO_URL);
    const transactions = await Transaction.find({email:email});
    res.json(transactions);
});

app.get('/api/check-auth', (req, res) => {
    if (req.session.user) {
        res.json({ status: 'ok', user: req.session.user });
    } else {
        res.json({ status: 'error', user: null });
    }
});

app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.json({ status: 'error', error: err });
        }
        res.clearCookie('connect.sid', { path: '/' }); 
        res.json({ status: 'ok' });
    });
});
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
