
// assigne l'onglet active a celui de la page actuelle, est utilisé dans navbar.pug
function assignActive(id) {
  if (id) { document.getElementById(id).classList.add("active") }
}

// fonction servant a afficher les messages sur le template contact.pug
function printMessage(obj, isHistory = false) {
  let msg = document.createElement("li")
  let content = document.createElement("span")
  let time = document.createElement("span")
  const messageList = document.querySelector('#messages')

  content.innerHTML = `${obj.sender}: ${obj.content}`
  time.innerHTML = obj.datetime
  msg.classList.add("list-group-item", "flexli")
  time.classList.add("time")
  
  // si les messages viennent de l'historique, les insère en haut des messages actuels
  if (isHistory) {
  messageList.insertBefore(msg, messageList.firstChild)
  } else {
  messageList.appendChild(msg)
  }
  // positionne la date et l'heure à droite du message
  msg.appendChild(content)
  msg.appendChild(time);
}

// retourne l'objet de connection a la db, utilisé coté server
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

// insère le message en db, utilisé coté server
function insertMessage(connection, content, datetime, sender) {
  connection.connect();
  return new Promise((resolve, reject) => {
    connection.query(`INSERT INTO message(content, datetime, sender) VALUES (?, ?, ?)`, [content, datetime, sender], function(error, result){
      if (error) reject(error)
      resolve(result)
    })
  })
}

// récupère les messages en db, utilisé coté server
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

// broadcast le message reçu et la réponse générée, utilisé coté server
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