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
const he = require('he')
dotenv.config()
app.set("view engine", "pug");
app.set('views', './views')

app.use(express.static('public'))
app.use(express.static('node_modules'))

// set la page défaut a la page accueil
app.get('/', (req, res) => {
    res.redirect(301, `http://localhost:${process.env.port}/accueil`)
})

// page accueil : simple page d'accueil redirigeant a la liste des boissons
app.get('/accueil', (req, res) => {
    renderHtml(res, 'accueil', 'Punk: Home')
})

// page boissons : liste des boissons
app.get('/boissons', async (req, res) => {
    let resp = await axios('https://api.punkapi.com/v2/beers')
    renderHtml(res, 'boissons', 'Punk: Beers', resp.data)
})

// page details : infos relatives a la boisson
app.get('/boisson-details/:id', async (req, res) => {
    let beerId = req.params.id
    let beer = await axios(`https://api.punkapi.com/v2/beers/${beerId}`)
    renderHtml(res, 'boisson_details', beer.data[0].name, beer.data[0])

})

// page random : charge la page details avec des données aléatoires
app.get('/random', async (req, res) => {
    let beer = await axios(`https://api.punkapi.com/v2/beers/random`)
    renderHtml(res, 'boisson_details', beer.data[0].name, beer.data[0])
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
    let bot_responses = {
        default: 'We received your message and will get back to you ASAP !',
        closeSuccess: 'Database disabled',
        closeFailure: "Database isn't activated, activate it with /storeToDb",
        openSuccess: 'Database activated, every message from you will now be stored',
        openFailure: 'Database is already activated, disable it with /closeDb',
        storeSyntax: "the /storeToDb command doesn't take any argument",
        closeSyntax: "the /closeDb command doesn't take any argument"
    }
    let actualBotResponse = bot_responses['default']
    socket.on("message", obj => {
        // on vérifie encore une fois si le message a un contenu 
        // (la protection front ne suffit pas pour ça mais peut empêcher d'envoyer des requêtes inutiles)
        if(!!obj.message){
            // on convertis les caractères non alphanumériques pour éviter des injection style <script>alert('lol des barres le hacking')</script>
            // qui même sans fonctionner afficherait un blanc dans le chat
            obj.message = he.encode(obj.message)
            obj.sender = he.encode(obj.sender)
            obj.date = he.encode(obj.date)
            console.log(obj.message, obj.sender, obj.date)
            
            // on detecte la commande /storeToDb
            if (obj.message.trim() === '/storeToDb') {
                if(registerDb) {
                    actualBotResponse = bot_responses['openFailure']
                    myfunctions.broadcastAndRespond(io, obj, actualBotResponse)
                    return
                }
                actualBotResponse = bot_responses['openSuccess']
                myfunctions.broadcastAndRespond(io, obj, actualBotResponse)
                registerDb = true
                myfunctions.insertMessage(myfunctions.initDB(), actualBotResponse, obj.date, 'PunkBot').then((result) => console.log(result))
                myfunctions.insertMessage(myfunctions.initDB(), obj.message, obj.date, obj.sender).then((result) => console.log(result))
                return
            } else if (obj.message.trim().slice(0, 10) === '/storeToDb'){
                actualBotResponse = bot_responses['openSyntax']
                myfunctions.broadcastAndRespond(io, obj, actualBotResponse)
                if(!!registerDb){
                    myfunctions.insertMessage(myfunctions.initDB(), actualBotResponse, obj.date, 'PunkBot').then((result) => console.log(result))
                    myfunctions.insertMessage(myfunctions.initDB(), obj.message, obj.date, obj.sender).then((result) => console.log(result))
                }
                return
            }

            if (obj.message.trim() === '/closeDb') {
                if(!registerDb) {
                    actualBotResponse = bot_responses['closeFailure']
                    myfunctions.broadcastAndRespond(io, obj, actualBotResponse)
                    return
                }
                actualBotResponse = bot_responses['closeSuccess']
                myfunctions.broadcastAndRespond(io, obj, actualBotResponse)
                myfunctions.insertMessage(myfunctions.initDB(), actualBotResponse, obj.date, 'PunkBot').then((result) => console.log(result))
                myfunctions.insertMessage(myfunctions.initDB(), obj.message, obj.date, obj.sender).then((result) => console.log(result))
                registerDb = false
                return
            } else if (obj.message.trim().slice(0, 10) === '/closeDb'){
                actualBotResponse = bot_responses['closeSyntax']
                myfunctions.broadcastAndRespond(io, obj, actualBotResponse)
                if(!!registerDb){
                    myfunctions.insertMessage(myfunctions.initDB(), actualBotResponse, obj.date, 'PunkBot').then((result) => console.log(result))
                    myfunctions.insertMessage(myfunctions.initDB(), obj.message, obj.date, obj.sender).then((result) => console.log(result))
                }
                return
            }
             // si l'enregistrement est actif, on insere les message en db
            if(!!registerDb){
                myfunctions.insertMessage(myfunctions.initDB(), actualBotResponse, obj.date, 'PunkBot').then((result) => console.log(result))
                myfunctions.insertMessage(myfunctions.initDB(), obj.message, obj.date, obj.sender).then((result) => console.log(result))
            }
            // broadcast le message
            myfunctions.broadcastAndRespond(io, obj, bot_responses['default'])
        }
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