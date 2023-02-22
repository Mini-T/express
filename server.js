const express = require('express')
const app = express()
const dotenv = require('dotenv')
const axios = require('axios')
dotenv.config()
const http = require('http')
app.set("view engine", "pug");
app.set('views', './views')
const server = http.createServer(app)
const { Server } = require('socket.io');
const path = require('path');
const cors = require('cors');


app.get('/socket.io/socket.io.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'node_modules', 'socket.io', 'client-dist', 'socket.io.js'));
});


app.get('/', (req,res) =>{
    res.redirect(301, `http://localhost:${process.env.port}/accueil`)
})

app.get('/accueil', (req,res) => {
    page = 'root'

    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.render('accueil', {title: ('Punk: Home')})
})

app.get('/boissons', async (req,res) => {
    let resp = await axios('https://api.punkapi.com/v2/beers')
    console.log(resp)

    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.render('boissons', {title: 'Punk: Beers', beers: resp.data})

})

app.get('/boisson-details/:id', async (req,res) => {
    let beerId = req.params.id
    let beer = await axios(`https://api.punkapi.com/v2/beers/${beerId}`)
    console.log(beer)
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.render('boisson_details', {title: beer.data[0].name, data: beer.data[0]})
})

app.get('/random', async (req,res) => {
    let beer = await axios(`https://api.punkapi.com/v2/beers/random`)
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.render('random_boisson', {title: beer.data[0].name, data: beer.data[0]})
})

// autorise les connections 
const io = new Server(server, {
    cors: {
      origin: "http://localhost:8080",
      methods: ["GET", "POST"]
    }
  });

io.on("connection", (socket) => {
  // receive a message from the client
  console.log('connected')
  socket.on("message", msg => {
    io.emit('message', msg)
});
});
server.listen(3000, () => {
    console.log('socket!')
})

app.get('/contact', (req,res) => {
    res.header('Content-Type', 'text/html; charset=utf-8');
    res.render('contact', {title: "Contact us"})
})

app.listen(process.env.port, () => {
    console.log('listening')
})