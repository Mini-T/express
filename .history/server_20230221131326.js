const express = require('express')
const port = 8080
const app = express()
const dotenv = require('./<label for="inputName">Input label</label>
<input type="text" class="form-control is-valid" name="inputName" id="inputName">
<div class="invalid-feedback">
    Validation message
</div>
<!-- TODO: This is for server side, there is another version for browser defaults --> ')

app.set("view engine", "pug");
app.set('views', './views')

app.get('/', (req,res) =>{
    res.redirect(301, `http://localhost:${port}/accueil`)
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

app.listen(port, () => {
    console.log('listening')
})