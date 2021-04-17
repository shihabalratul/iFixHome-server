const express = require('express')
const app = express()
const port = 8080
const cors = require('cors')
const dotenv = require('dotenv');
const fs = require('fs-extra');
const fileUpload = require('express-fileupload')
const ObjectId = require('mongodb').ObjectId;

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
	const reviewCollection = client.db(`${process.env.DB_USER}`).collection("reviews");
	const adminCollection = client.db(`${process.env.DB_USER}`).collection("admins");
	const bookingsCollection = client.db(`${process.env.DB_USER}`).collection("bookings");


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

	})

	app.post('/addReview', (req, res) => {
		reviewCollection.insertOne(req.body)
			.then(data => res.send(data));
	})


	app.get('/services', (req, res) => {
		servicesCollection.find({})
			.toArray((err, document) => {

				res.send(document);
			})
	})

	app.get('/reviews', (req, res) => {
		reviewCollection.find({})
			.toArray((err, document) => {

				res.send(document);
			})
	})

	app.post('/addAdmin', (req, res) => {
		adminCollection.insertOne(req.body)
			.then(data => res.send(data));
	})


	app.post('/checkAdmin', (req, res) => {
		const email = req.body.email
		adminCollection.find({ email: email })
			.toArray((err, data) => {
				res.send(data.length > 0)

			})
	})

	app.post('/getBookings', (req, res) => {
		const email = req.body.email;
		adminCollection.find({ email })
			.toArray((err, document) => {
				if (document.length > 0) {
					bookingsCollection.find({})
						.toArray((err, document) => {
							res.send(document)
						})
				} else {
					bookingsCollection.find({ email: email })
						.toArray((err, document) => {
							res.send(document)
						})
				}
			}
			)
	})


	app.get('/getService/', (req, res) => {
		const id = req.query.id;
		console.log(id)
		servicesCollection.find({ _id: new ObjectId(id) })
			.toArray((err, document) => {
				res.send(document)

			})
	})

	app.post('/checkout', (req, res) => {
		bookingsCollection.insertOne(req.body)
			.then(data => console.log(data))
	})


	app.post('/updateStatus', (req, res) => {
		const id = req.body.id;
		bookingsCollection.findOneAndUpdate({ "_id": new ObjectId(id) },
			{
				$set: { status: req.body.status }
			})
			.then((document) => {
				res.send(document)
			})
	});


	app.post('/removeService', (req, res) => {
		const id = req.body.id;
		servicesCollection.findOneAndDelete({ _id: new ObjectId(id) })
			.then((document) => {
				res.send(document)

			})
	})




	app.listen(port || process.env.PORT)
})