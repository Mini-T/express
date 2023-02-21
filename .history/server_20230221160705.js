const express = require('express')
const app = express()
const dotenv = require('dotenv')
const axios = require('axios')
dotenv.config()
app.set("view engine", "pug");
app.set('views', './views')

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
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.render('boisson_details', {title: beer.data[].name, data: beer.data[0].name})
})

app.get('/random', (req,res) => {

})

app.get('/contact', (req,res) => {

})

app.listen(process.env.port, () => {
    console.log('listening')
})