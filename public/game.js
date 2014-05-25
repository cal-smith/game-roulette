var games = [],
	room = window.location.pathname.slice(1),
	socket = io.connect(window.location.origin+':8000'),
	init = false;
function add_games(game){
	games.push(game);
	var id = game.replace(/\s+/g, "_");
	elem("gamelist").innerHTML += "<div id="+id+"><span>[<a href='#' onclick=send_remove('"+id+"')>remove</a>]&nbsp;&nbsp;</span>"+game+"</div>";
}

function remove_game(game){
	var id = game.replace(/\s+/g, "_");
	id = id.trim();
	var index = games.indexOf(id);
	console.log(index);
	games.splice(index, 1);
	elem("gamelist").removeChild(elem(id));
}

function send_remove(id){
	var game = id.replace(/_+/g, " ");
	socket.emit('remove', {'game':game, 'room':room});
}

function decide(){
	socket.emit('decide', {"room":room, "games":games});
}

document.addEventListener("DOMContentLoaded", function(event) {
	elem("gameform").addEventListener("submit", function(event){
		event.preventDefault();
		var game;
		if (elem("game").value !== ""){
			game = elem("game").value;
			elem("game").value="";
		}
		if (games.indexOf(game) === -1){
			socket.emit('add', {"room":room, "game":game});
		}
	});

	socket.on('init', function(data){
		if (!init){
			for (var i = 0; i < data.games.length; i++) {
				add_games(data.games[i]);
				elem("out").innerHTML = data.random;
			}
		}
		init = true;
	});

	socket.on('room_init', function(data){
		init = true;
	});

	socket.emit('sub', {"room":room});

	socket.on('add', function(data){
		add_games(data.game);
	});

	socket.on('remove', function(data){
		remove_game(data.game);
	});

	socket.on('decide', function(data){
		elem("out").innerHTML = data.random;
	});
});
function elem(e){
	return document.getElementById(e);
}
