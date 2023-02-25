
function assignActive(id) {
  if (id) { document.getElementById(id).classList.add("active") }
}

function printMessage(obj, isHistory = false) {
  if (isHistory) {
    for(message of obj.result) {
      console.log(message)
      let msg = document.createElement("li")
      let content = document.createElement("span")
      content.innerHTML = `${message.sender}: ${message.content}`
      msg.classList.add("list-group-item", "flexli")
      document.querySelector('#messages').insertBefore(msg, document.querySelector('.list-group-item'))
      let time = document.createElement("span")
      time.setAttribute("class", "time")
      time.innerHTML = message.datetime
      msg.appendChild(content)
      msg.appendChild(time);
    }
    return
  }
  let msg = document.createElement("li")
  let content = document.createElement("span")
  content.innerHTML = `${obj.sender}: ${obj.content}`
  msg.classList.add("list-group-item", "flexli")
  document.querySelector('#messages').appendChild(msg)
  let time = document.createElement("span")
  time.setAttribute("class", "time")
  time.innerHTML = obj.datetime
  msg.appendChild(content)
  msg.appendChild(time);
}

function initDB() {
  const mysql = require('mysql');
  const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'beerChat'
  });
  return connection;
}

function insertMessage(connection, content, datetime, sender) {
  connection.connect();
  return new Promise((resolve, reject) => {
    connection.query(`INSERT INTO message(content, datetime, sender) VALUES (?, ?, ?)`, [content, datetime, sender], function(error, result){
      if (error) reject(error)
      resolve(result)
    })
  })
}

function getHistory() {
  let connection = initDB()
  connection.connect()
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM message', function (error, results) {
      if (error) reject(error);
      resolve(results);
    });
  });
}

function broadcastAndRespond(io, obj, answer) {
  io.emit('message', {content: obj.message, datetime: obj.date, sender:obj.sender})
  io.emit('response', {content: answer, sender: 'PunkBot', datetime:obj.date})
}


module.exports = {
  assignActive: assignActive,
  printMessage: printMessage,
  initDB: initDB,
  insertMessage: insertMessage,
  getHistory: getHistory,
  broadcastAndRespond: broadcastAndRespond,
}