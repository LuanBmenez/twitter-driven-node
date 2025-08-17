
import express from 'express';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

mongoClient.connect()

const app = express();
let db;

async function connectDB() {
	try {
		const mongoClient = new MongoClient(process.env.DATABASE_URL);
		await mongoClient.connect();
		db = mongoClient.db();
		console.log('Conectado ao MongoDB');
	} catch (err) {
		console.error('Erro ao conectar ao MongoDB:', err);
	}
}

connectDB();

import Joi from 'joi';

app.use(express.json());


const userSchema = Joi.object({
	username: Joi.string().required(),
	avatar: Joi.string().uri().required()
});


const tweetSchema = Joi.object({
	username: Joi.string().required(),
	tweet: Joi.string().required()
});


app.post('/sign-up', async (req, res) => {
	const { error } = userSchema.validate(req.body);
	if (error) return res.status(422).send(error.details.map(e => e.message));

	try {
		await db.collection('users').insertOne(req.body);
		return res.sendStatus(201);
	} catch (err) {
		return res.status(500).send('Erro ao cadastrar usuário');
	}
});

// POST /tweets
app.post('/tweets', async (req, res) => {
	const { error } = tweetSchema.validate(req.body);
	if (error) return res.status(422).send(error.details.map(e => e.message));

	const { username } = req.body;
	const user = await db.collection('users').findOne({ username });
	if (!user) return res.sendStatus(401);

	try {
		await db.collection('tweets').insertOne(req.body);
		return res.sendStatus(201);
	} catch (err) {
		return res.status(500).send('Erro ao cadastrar tweet');
	}
});
