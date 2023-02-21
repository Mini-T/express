const express = require('express')
const port = 8080
const app = express()

app.set("view engine", "pug");
app.set('views', './views')

app.get('/', (req,res) =>{
    window.location.href = `http://localhost:${port}/accueil`
})

app.get('/accueil', (req,res) => {
    page = 'root'

    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.render('accueil', {title: ('Punk: accueil')})
})

app.get('/boissons', (req,res) => {

})

app.listen(port, () => {
    console.log('listening')
})