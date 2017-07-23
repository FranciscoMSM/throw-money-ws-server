const express = require('express');
const http = require('http');
const url = require('url');
const WebSocket = require('ws');

const app = express();
const PORT = process.env.PORT || 8000;

const users = {};
let lastID = 1;

app.use(function (req, res) {
  res.send({ msg: "hello" });
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.broadcast = function broadcast(data) {
  users.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

function sendToClient(data, id) {
  if (users[id].readyState === WebSocket.OPEN) {
    users[id].send(data);
  } else {
    users[id] = undefined;
  }
};

wss.on('connection', function connection(ws, req) {
  ws.id = lastID++;
  users[ws.id] = ws;

  ws.on('message', function incoming(message) {
    const msg = JSON.parse(message);
    sendToClient(msg.data, msg.id)
    console.log(msg)
  });

  ws.send(`ID-${ws.id}`);
});

server.listen(PORT, function listening() {
  console.log('Listening on %d', server.address().port);
});
