var games = [],
	room = window.location.pathname.slice(1),
	socket = io.connect('http://localhost');
	init = false;
function add_games(game, id){
	games.push(game);
	elem("gamelist").innerHTML += "<div id="+id+"><span>[<a href='#' onclick=send_remove('"+id+"')>remove</a>]&nbsp;&nbsp;</span>"+game+"</div>";
}

function remove_game(id){
	var id = id.trim();
	var index = games.indexOf(id);
	console.log(index);
	games.splice(index, 1);
	elem("gamelist").removeChild(elem(id));
}

function send_remove(id){
	socket.emit('remove', {'id':id, 'room':room});
}

function decide(){
	socket.emit('decide', {"room":room, "games":games});
}

document.addEventListener("DOMContentLoaded", function(event) {
	elem("gameform").addEventListener("submit", function(event){
		//event.stopPropagation();
		event.preventDefault();
		var game,
			id;
		if (elem("game").value !== ""){
			game = elem("game").value;
			id = game.replace(/\s+/g, "_");
			elem("game").value="";
		}
		socket.emit('add', {"room":room, "game":game, "id":id});
	});

	socket.on('init', function(data){
		if (!init){
			for (var i = 0; i < data.games.length; i++) {
				add_games(data.games[i]);
				init = true;
			}
		}
	});

	socket.on('do_init', function(data){
		if (data.first){
			init = true;
		} else {
			socket.emit('do_init', {"room":room, "games":games});
		}
	});

	socket.emit('sub', {"room":room});
	socket.on('add', function(data){
		add_games(data.game, data.id);
	});

	socket.on('remove', function(data){
		remove_game(data.id);
	});

	socket.on('decide', function(data){
		elem("out").innerHTML = games[data.random];
	});
});
function elem(e){
	return document.getElementById(e);
}
