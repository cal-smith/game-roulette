var express = require("express");
var app = express();
var server = require('http').createServer(app)
var io = require('socket.io').listen(server);

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
	var id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = (Date.now() + Math.random()*16)%16|0, v = c == 'x' ? r : (r&0x3|0x8);
		return v.toString(16);
	});
	res.redirect('/'+id);
});

app.get('/:id', function(req, res){
	res.sendfile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket){
	socket.on('sub', function(data){
		socket.join(data.room);
		var room = '/' + data.room;
		console.log(io.sockets.manager.rooms.room);
		if (io.sockets.clients(data.room).length > 1){
			socket.broadcast.to(data.room).emit('do_init', {'first':false});
		} else {
			socket.broadcast.to(data.room).emit('do_init', {'first':true});
		}
	});

	socket.on('do_init', function(data){
		socket.broadcast.to(data.room).emit('init', {'games':data.games});
	});

	socket.on('add', function(data){
		io.sockets.in(data.room).emit('add', {'game':data.game, 'id':data.id});
	});

	socket.on('remove', function(data){
		io.sockets.in(data.room).emit('remove', {'id':data.id});
	});

	socket.on('decide', function(data){
		if(data.games.length > 0){
			var max = data.games.length;
			var random = Math.floor(Math.random()*max);
			io.sockets.in(data.room).emit('decide', {'random':random});
		}
	});
});

server.listen(8080);