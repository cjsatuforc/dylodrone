var express = require('express');
var path = require('path');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var last_action_date = Date.now();
var isControlled = false;

var redis = require("redis"),
    client = redis.createClient();
var status = null;

client.on("error", function (err) {
    console.log("Error " + err);
});

var portWeb = 8090;

app.engine('html', require('ejs').renderFile);
app.use(express.static(__dirname));

app.get('/', function(req, res) {
    res.render(__dirname + '/index.html');
});

io.sockets.on('connection', (socket) => {
    socket.on('command', (data) => {
        client.hset("drone:controller", "roll", parseInt(data.roll));
        client.hset("drone:controller", "pitch", parseInt(data.pitch));
        client.hset("drone:controller", "yaw", parseInt(data.yaw));
        client.hset("drone:controller", "throttle", parseInt(data.throttle));
        client.hset("drone:controller", "aux1", parseInt(data.aux[0]));
        client.hset("drone:controller", "aux2", parseInt(data.aux[1]));
        client.hset("drone:controller", "aux3", parseInt(data.aux[2]));
        client.hset("drone:controller", "aux4", parseInt(data.aux[3]));
    });
});

setInterval(() => {
    client.get("drone:status", function(err, reply) {
        // reply is null when the key is missing 
        status = reply;
    });
},1000);

server.listen(portWeb, () => console.log("app launched -> localhost:" + portWeb));