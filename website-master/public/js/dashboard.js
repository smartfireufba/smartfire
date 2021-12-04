$("#Regioes").on("click",function(){
	var x = document.getElementById("submenu-regioes");
	if (x.style.display === "none") {
		x.style.display = "block";
	} else {
		x.style.display = "none";
	}
});
$("#pontos-monitoramento").on("click",function(){
	var x = document.getElementById("submenu-ponto-monitoramento");
	if (x.style.display === "none") {
		x.style.display = "block";
	} else {
		x.style.display = "none";
	}
});
$("#monitoramento").on("click",function(){
	var x = document.getElementById("submenu-monitoramento");
	if (x.style.display === "none") {
		x.style.display = "block";
	} else {
		x.style.display = "none";
	}
});
$("#area-isolamento").on("click",function(){
	var x = document.getElementById("submenu-area-isolamento");
	if (x.style.display === "none") {
		x.style.display = "block";
	} else {
		x.style.display = "none";
	}
});

$("#alertas").on("click",function(){
	var x = document.getElementById("submenu-alertas");
	var c = document.getElementById('alertas-counter');
	var cs = document.getElementById('alertas-counter-sub');
	if (x.style.display === "none") {
		x.style.display = "block";
		c.style.display = "none";
	} else {
		x.style.display = "none";
		c.style.display = "block";
	}
});


if(typeof IconAlarmes !== 'undefined'){
	document.getElementById('alertas-counter').innerHTML = IconAlarmes.length;
	document.getElementById('alertas-counter-sub').innerHTML = IconAlarmes.length;
}else{
	document.getElementById('alertas-counter').innerHTML = "0";
	document.getElementById('alertas-counter-sub').innerHTML = "0";
}