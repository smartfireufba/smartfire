var monitoramento = []
var coord = []
var mark;
firebase.database().ref('regioes/').on('value', function (dataSnapshot) {
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
        mark = L.marker(monitoramento[i][3],{nome:monitoramento[i][0],code:monitoramento[i][1],nomeRegiao:monitoramento[i][2],posicaoInicial:monitoramento[i][3],codeIcon:monitoramento[i][4]}).on('click', onClick).addTo(map).bindPopup("<a href='monitoramentoPonto.html'>Ponto de Monitoramento:<br>"+monitoramento[i][0]+"</a>");
        console.log(mark);
    }
});

function onClick(e) {
    localStorage.setItem("codeRegiao",e.sourceTarget.options.code);
    localStorage.setItem("nomeRegiao",e.sourceTarget.options.nomeRegiao);
    localStorage.setItem("codeIcone",e.sourceTarget.options.codeIcon);
    localStorage.setItem("nomeIcone",e.sourceTarget.options.nome);
}

