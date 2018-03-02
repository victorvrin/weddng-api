const express = require('express')
const bodyParser = require('body-parser')
const Sequelize = require('sequelize')
const Op = Sequelize.Op;

const sequelize = new Sequelize('sequelize_tests','root','welcome12#',{
	dialect : 'sqlite',
	define : {
		timestamps : false
	},
  storage: 'database.sqlite'
})

const app = express()
app.use(bodyParser.json())
app.use(function(req,res,next){
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
})

const Guest = sequelize.define('/guests', {
	firstName : Sequelize.STRING,
	lastName : Sequelize.STRING,
	confirmed : Sequelize.BOOLEAN,
	preferences : Sequelize.JSON
})

Guest.belongsTo(Guest, { foreignKey: { allowNull: true }})
Guest.hasMany(Guest)

app.get('/reset', (req, res) => {
	sequelize.sync({force : true})
		.then(() => res.status(201).send('Baza de date este acum goala ... '))
		.catch(() => res.status(500).send('A aparut o eroare ...'))	
})

  //-----------------------\\
 //       /login           \\
//---------------------------\\
app.get('/login/:qrtoken', (req, res) => {
	console.log('server.js > /guests > ALL')
	res.status(200)
	res.json({"token": req.params.qrtoken})
})

  //-----------------------\\
 //       /guests           \\
//---------------------------\\

app.get('/guests', (req, res) => {
	console.log('server.js > /guests > ALL')
	Guest.findAll().then( (result) => {
		res.status(200)
		res.json(result)
	}).catch(() => {res.status(500).send('A aparut o eroare')})
})

app.get('/guests/:id', (req, res) => {
	console.log('server.js > /guests > ' + req.params.id)
	Guest.findAll({
		where: { id : req.params.id } 
	}).then( (result) => {
		res.status(200)
		res.json(result)
	}).catch(() => {res.status(500).send('A aparut o eroare')})
})

app.post('/guests', (req, res) => {
	if (req.query.bulk && req.query.bulk === 'on'){
		console.log('server.js > /guests POST > BULK')
		Guest.bulkCreate(req.body)
			.then(() => {
				res.status(201).send('Guests au fost creati')
			})
			.catch(() => res.status(500).send('A aparut o eroare ...'))
	} else {
		console.log('server.js > /guests POST > ' + req.body)
		Guest.create(req.body).then((result) => {
			res.status(201)
			res.json({id : 	result.id})
		}).catch(() => res.status(500).send('A aparut o eroare ...'))
	}
})

app.patch('/guests/:id', (req, res) => {
	Guest.update({
			url: req.body.url,
			type : req.body.type, 
			subject: req.body.subject
		},{
			where: { id : req.params.id}
		})
		.then((result) => {
			res.status(201).send({id : 	result})
		})
		.catch(() => res.status(500).send('A aparut o eroare in timpul modificarii guests...'))
})

app.listen(8080)