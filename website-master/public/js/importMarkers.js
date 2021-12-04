var monitoramento = []
var coord = []
var mark;
firebase.database().ref('regioes/').once('value').then(function (dataSnapshot) {
    dataSnapshot.forEach(function (childSnapshot) {
        //codeRegiao
        childSnapshot.child("pontosMonitoramento").forEach(function (childSnapshot1) {
        //codePontoMonitoramento
        coord = []
        coord[0] = childSnapshot1.child("coordenadas").child("lat").val();
        coord[1] = childSnapshot1.child("coordenadas").child("lng").val();
        monitoramento.push([childSnapshot1.child("nome").val(),childSnapshot.key,childSnapshot.child("nome").val(),coord,childSnapshot1.key]);
        });
        
    });
    console.log(monitoramento);
    var i;
    for(i=0; i < monitoramento.length; i++){
        mark = L.marker(monitoramento[i][3],{nome:monitoramento[i][0],code:monitoramento[i][1],nomeRegiao:monitoramento[i][2],posicaoInicial:monitoramento[i][3],codeIcon: monitoramento[i][4]}).addTo(map).bindPopup("Ponto de Monitoramento:<br>"+monitoramento[i][0]);
    }
    if(alarmisOn){
        map.eachLayer(function(layer){
            if(layer instanceof L.Marker && IconAlarmes.includes(layer.options.codeIcon)){
                layer.setIcon(alarmeIcon);
            }
        });
    }
});