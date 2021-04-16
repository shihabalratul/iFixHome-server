const express = require('express')
const app = express()
const port = 5000
const cors = require('cors')
const dotenv = require('dotenv');
const fs = require('fs-extra');
const fileUpload = require('express-fileupload')

dotenv.config();
app.use(cors())
app.use(express.json())
app.use(fileUpload())

const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.z7rjt.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

app.get('/', (req, res) => {
	res.send('Hello !')
})



const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
	const servicesCollection = client.db(`${process.env.DB_USER}`).collection("services");
	app.post('/addServices', (req, res) => {
		const file = req.files.img;
		const name = req.body.name;
		const price = Number(req.body.price);
		const description = req.body.description;
		const newImg = file.data;
		const encImg = newImg.toString('base64');

		const img = {
			contentType: file.mimetype,
			size: file.size,
			img: Buffer.from(encImg, 'base64')
		}
		servicesCollection.insertOne({ name, price, description, img })
			.then(data => res.send(data));

	}
	)
});


app.listen(port || process.env.PORT)