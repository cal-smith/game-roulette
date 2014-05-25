var express = require("express");
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var Db = require('mongodb').Db, 
	Server = require('mongodb').Server,
	Connection = require('mongodb').Connection;

var db = new Db('game', new Server('localhost', 27017));

db.open(function(err, db) {});

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
		db.collection('rooms', function(err, col){
			col.count({'room':data.room}, function(err, count){
				if (count === 0) {
					col.insert({'room':data.room, 'games':[], 'decide':'Game-Roulette!'});
					io.sockets.in(data.room).emit('room_init');
				} else{
					col.find({'room':data.room}).toArray(function(err, result){
						console.log(result[0]);
						io.sockets.in(data.room).emit('init', {'games':result[0].games, 'random':result[0].decide});
					});
				}
			});
		});
	});

	socket.on('add', function(data){
		db.collection('rooms', function(err, col){
			col.update({'room':data.room}, {$push: {'games':data.game}});
		});
		io.sockets.in(data.room).emit('add', {'game':data.game});
	});

	socket.on('remove', function(data){
		db.collection('rooms', function(err, col){
			col.update({'room':data.room}, {$unset: {'games.$':data.game}});
			col.update({'room':data.room}, {$pull: {'games':data.game}});
		});
		io.sockets.in(data.room).emit('remove', {'game':data.game});
	});

	socket.on('decide', function(data){
		if(data.games.length > 0){//replace with db lookup?
			var max = data.games.length;
			var random = Math.floor(Math.random()*max);
			random = data.games[random];
			io.sockets.in(data.room).emit('decide', {'random':random});
			db.collection('rooms', function(err, col){
				col.update({'room':data.room}, {$set: {'decide':random}});
			});
		}
	});
});

server.listen(8080);