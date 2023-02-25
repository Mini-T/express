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
const myfunctions = require('./public/functions')
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
    let date = new Date()
    date = date.toLocaleString() 
    io.emit("message",{content:'You can store our messages in database by typing /storeToDb (and only that)' ,datetime: date, sender: 'PunkBot'} )
    let loadedHistory = false
    let registerDb = false
    let bot_response = 'We received your message and will get back to you ASAP !'
    socket.on("message", obj => {
        if(!!registerDb){
            myfunctions.insertMessage(myfunctions.initDB(), bot_response, obj.date, 'PunkBot').then((result) => console.log(result))
            myfunctions.insertMessage(myfunctions.initDB(), obj.message, obj.date, obj.sender).then((result) => console.log(result))
        }
    
        if (obj.message.trim() === '/storeToDb') {
            if(registerDb) {
                myfunctions.broadcastAndRespond(io, obj, 'Database is already activated')
                return
            }
            myfunctions.broadcastAndRespond(io, obj, 'Database activated, every message from you will now be stored')
            registerDb = true
            return
        } else if (obj.message.trim().slice(0, 10) === '/storeToDb'){
            myfunctions.broadcastAndRespond(io, obj, "the /storeToDb command doesn't take any argument")
            return
        }
        // broadcast le message
        myfunctions.broadcastAndRespond(io, obj, bot_response)
    });

    socket.on("historyRequest", async () => {
        if(!loadedHistory){
            result = myfunctions.getHistory().then(result =>{
                io.emit('history', {result: result})
                loadedHistory = true
            })
        } else {
            console.log('history already loaded')
        }
    })
});


server.listen(3000, () => {
    console.log('socket listening on port 3000')
})

app.listen(process.env.port, () => {
    console.log(`webserver listening on port ${process.env.port}`)
})


function renderHtml(res, page, title, data = null) {
    res.header('Content-Type', 'text/html; charset=utf-8');
    //la page détails n'a pas de lien dans la navbar, j'annule donc le paramètre active
    if (page === 'boisson_details') {
        res.render(page, { title: title, data: data })
        return
    }
    res.render(page, { title: title, active: page, data: data })
}