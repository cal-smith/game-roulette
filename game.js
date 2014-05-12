var games = [];
function add_games(){
	if (elem("game").value !== ""){
		var game = elem("game").value;
		games.push(game);
		elem("gamelist").innerHTML += "<div id="+game+"><span>[<a href='#' onclick=remove_game('"+game+"')>remove</a>]&nbsp;&nbsp;</span>"+game+"</div>";
		elem("game").value="";
	}
}
function remove_game(id){
	var id = id.trim();
	var index = games.indexOf(id);
	console.log(index);
	games.splice(index, 1);
	elem("gamelist").removeChild(elem(id));
}
function decide(){
	if(games.length > 0){
		var max = games.length;
		var random = Math.floor(Math.random()*max);
		out.innerHTML = games[random];
	}
}
document.addEventListener("DOMContentLoaded", function(event) {
	elem("gameform").addEventListener("submit", function(event){
		event.stopPropagation();
		event.preventDefault();
		add_games();
	});
});
function elem(e){
	return document.getElementById(e);
}
