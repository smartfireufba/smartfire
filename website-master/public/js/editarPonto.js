var regions = []
var pontosMonitoramento = []
var pontos = []
var markerx;
var nome;
var coord = []
var selected;
firebase.database().ref('regioes/').on('value', function (dataSnapshot) {
    dataSnapshot.forEach(function (childSnapshot) {
        //regiao
        regions.push(childSnapshot.key);
        childSnapshot.child("pontosMonitoramento").forEach(function (childSnapshot1) {
        //pontos
        nome = childSnapshot1.key;
        coord = []
        childSnapshot1.child("coordenadas").forEach(function (childSnapshot2) {
            if(childSnapshot2.key == "lat"){
                coord[0] = childSnapshot2.val();
            }else{
                coord[1] = childSnapshot2.val();
            }
        });
        pontos.push([nome,childSnapshot.key,coord]);
        });
        
    });
    console.log(pontos);
    var i;
    for(i=0; i < pontos.length; i++){
        markerx = L.marker(pontos[i][2],{name:pontos[i][0],region:pontos[i][1], firstPos: pontos[i][2], draggable: false}).on("drag", function(e) {
            if(selected!=e.target && selected!=undefined)selected.setLatLng(selected.options.firstPos);
            selected = e.target;
            }).addTo(map).bindPopup("Ponto de Monitoramento:<br>"+pontos[i][0]);
        console.log(markerx);
        pontosMonitoramento.push(markerx);
    }
    console.log(pontosMonitoramento);
});

