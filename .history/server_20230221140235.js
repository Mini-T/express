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
    res.render('accueil', {title: ('Punk: accueil')})
})

app.get('/boissons', (req,res) => {

    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.render('boissons', {title: "Punk: Boissons"})
})

app.get('/boisson-details/:boisson', (req,res) => {

})

app.get('/random', (req,res))

app.listen(process.env.port, () => {
    console.log('listening')
})