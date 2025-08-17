import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import Joi from 'joi';

dotenv.config();

const app = express();
let db;

async function connectDB() {
	try {
		const mongoClient = new MongoClient(process.env.DATABASE_URL);
		await mongoClient.connect();
		db = mongoClient.db();
		console.log('Conectado ao MongoDB');

		// só inicia o servidor depois de conectar ao banco
		const PORT = process.env.PORT || 5000;
		app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
	} catch (err) {
		console.error('Erro ao conectar ao MongoDB:', err);
	}
}

connectDB();
app.use(cors());
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

app.put('/tweets/:id', async (req, res) => {
	const { error } = tweetSchema.validate(req.body);
	if (error) return res.status(422).send(error.details.map(e => e.message));

	const { id } = req.params;
	try {
		const tweet = await db.collection('tweets').findOne({ _id: new ObjectId(id) });
		if (!tweet) return res.sendStatus(404);

		await db.collection('tweets').updateOne(
			{ _id: new ObjectId(id) },
			{ $set: { tweet: req.body.tweet } }
		);
		return res.sendStatus(204);
	} catch (err) {
		return res.status(500).send('Erro ao editar tweet');
	}
});

app.delete('/tweets/:id', async (req, res) => {
	const { id } = req.params;
	try {
		const tweet = await db.collection('tweets').findOne({ _id: new ObjectId(id) });
		if (!tweet) return res.sendStatus(404);

		await db.collection('tweets').deleteOne({ _id: new ObjectId(id) });
		return res.sendStatus(204);
	} catch (err) {
		return res.status(500).send('Erro ao deletar tweet');
	}
});

app.get('/tweets', async (req, res) => {
	try {
		const tweets = await db.collection('tweets')
			.find({})
			.sort({ _id: -1 })
			.toArray();

		const users = await db.collection('users').find({}).toArray();
		const userMap = {};
		users.forEach(u => { userMap[u.username] = u.avatar; });

		const result = tweets.map(t => ({
			_id: t._id,
			username: t.username,
			avatar: userMap[t.username] || null,
			tweet: t.tweet
		}));

		res.send(result);
	} catch (err) {
		res.status(500).send('Erro ao buscar tweets');
	}
});

app.get('/tweets/:username', async (req, res) => {
	const { username } = req.params;
	try {
		const user = await db.collection('users').findOne({ username });
		if (!user) return res.status(404).send('Usuário não encontrado');

		const tweets = await db.collection('tweets')
			.find({ username })
			.sort({ _id: -1 })
			.toArray();

		const result = tweets.map(t => ({
			_id: t._id,
			username: t.username,
			avatar: user.avatar,
			tweet: t.tweet
		}));

		res.send(result);
	} catch (err) {
		res.status(500).send('Erro ao buscar tweets do usuário');
	}
});

export default app;

