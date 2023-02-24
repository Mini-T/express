
function assignActive(id) {
    if(id){document.getElementById(id).classList.add("active")}
}

function printMessage(sender, message, date) {
    let msg = document.createElement("li")
    msg.innerHTML = `${sender}: ${message}`
    msg.classList.add("list-group-item", "flexli")
    document.querySelector('#messages').appendChild(msg);
    let time = document.createElement("span")
    time.innerHTML = date
    msg.appendChild(time);
}

function initDB() {
    const mariadb = require('mariadb');
const pool = mariadb.createPool({
     host: 'localhost', 
     user:'root', 
     password: '',
     database:"beerChat"
});
return pool
}

function insertMessage(pool, content, datetime, sender){
    pool.getConnection()
    .then(conn => {
    
    conn.query(`INSERT INTO message(content, datetime, sender) value('${content}', '${datetime}', '${sender}')`)
        .then((res) => {
          console.log(res)
          conn.end()
        })
        .catch(err => {
          //handle error
          console.log(err) 
          conn.end();
        })
        
    }).catch(err => {
      console.log(err)
    });
}

function getHistory(pool){
  pool.getConnection()
    .then(conn => {
    
    conn.query(`SELECT * FROM message`)
        .then((res) => {
          return res
        })
        .catch(err => {
          //handle error
          console.log(err) 
          conn.end();
        })
        
    }).catch(err => {
      console.log(err)
    });
}

module.exports = {assignActive, initDB, printMessage, insertMessage, getHistory}