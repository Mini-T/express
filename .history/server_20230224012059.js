const express = require('express')
const dotenv = require('dotenv')
const axios = require('axios')
const { Server } = require('socket.io');
const http = require('http')
const path = require('path');
const { render } = require('pug');
//socket server
const app = express()
const server = http.createServer(app)
const {assignActive, initDB, insertMessage, } = require('./public/functions')
console.log(myfunctions)
dotenv.config()
app.set("view engine", "pug");
app.set('views', './views')

app.use(express.static('public'))
app.use(express.static('node_modules'))


app.get('/', (req, res) => {
    res.redirect(301, `http://localhost:${process.env.port}/accueil`)
})

app.get('/accueil', (req, res) => {
    renderHtml(res, 'accueil', 'Punk: Home')
})

app.get('/boissons', async (req, res) => {
    let resp = await axios('https://api.punkapi.com/v2/beers')
    renderHtml(res, 'boissons', 'Punk: Beers', resp.data)
})

app.get('/boisson-details/:id', async (req, res) => {
    let beerId = req.params.id
    let beer = await axios(`https://api.punkapi.com/v2/beers/${beerId}`)
    renderHtml(res, 'boisson_details', beer.data[0].name, beer.data[0])

})

app.get('/random', async (req, res) => {
    let beer = await axios(`https://api.punkapi.com/v2/beers/random`)
    renderHtml(res, 'random_boisson', beer.data[0].name, beer.data[0])
})

//renvoie la page contact
app.get('/contact', (req, res) => {
    renderHtml(res, "contact", "Contact us")
})

// autorise les connections uniquement depuis localhost:8080, NE MARCHE PAS SANS
const io = new Server(server, {
    cors: {
        origin: "http://localhost:8080",
        methods: ["GET", "POST"]
    }
});

// Ecoute les connections au socket
io.on("connection", (socket) => {

    socket.on("message", obj => {
        let registerDb = false
        if (obj.message.slice(0, 10) === '/storeToDb') {
            registerDb = true
        }
        if(!!registerDb){
            myfunctions.insertMessage(myfunctions.initDB(), obj.message, obj.date, obj.sender)
        }
        // broadcast le message
        io.emit('message', {content: obj.message, datetime: obj.date, sender:obj.sender})
        // envoi un message automatique
        io.emit('response', {content: 'We received your message and will get back to you ASAP !', sender: 'PunkBot', datetime:obj.date})
    });
});


server.listen(3000, () => {
    console.log('socket listening on port 3000')
})

app.listen(process.env.port, () => {
    console.log(`webserver listening on port ${process.env.port}`)
})


function renderHtml(res, page, title, data = null) {
    res.header('Content-Type', 'text/html; charset=utf-8');
    //la page d??tails n'a pas de lien dans la navbar, j'annule donc le param??tre active
    if (page === 'boisson_details') {
        res.render(page, { title: title, data: data })
        return
    }
    res.render(page, { title: title, active: page, data: data })
}