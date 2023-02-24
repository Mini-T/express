
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
        .then((rows) => {
          console.log(rows);
          return ;
        })
        .then((res) => {
          console.log(res); // { affectedRows: 1, insertId: 1, warningStatus: 0 }
          conn.end();
        })
        .catch(err => {
          //handle error
          console.log(err); 
          conn.end();
        })
        
    }).catch(err => {
      //not connected
    });
}

module.exports = {
    assignActive: assignActive(),
    printMessage: printMessage(),
    initDB: initDB,
    insertMessage: insertMessage
  };