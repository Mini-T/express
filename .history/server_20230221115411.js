const express = require('express')
const port = 8080
const app = express()

app.set("view engine", "pug");
app.set('views', './views')

app.get('/', (req,res) => {
    page = 'root'

    res.setHeader(Content-type)
})