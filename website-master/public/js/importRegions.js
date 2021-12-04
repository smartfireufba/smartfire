var regioes = []
var latlngRegiao = []
var regiao;

firebase.database().ref('regioes/').once('value').then(function (dataSnapshot) {
    dataSnapshot.forEach(function (childSnapshot) {
        //regiao
        latlngRegiao = []
        childSnapshot.child("coordenadas").forEach(function (childSnapshot1) {
            //pontos
            var coord = [2];
            childSnapshot1.forEach(function (childSnapshot2) {
                if(childSnapshot2.key == "lat"){
                    coord[0] = childSnapshot2.val();
                }else{
                    coord[1] = childSnapshot2.val();
                }
            });
            latlngRegiao.push(coord);
        });
        regioes.push([childSnapshot.child("nome").val(),childSnapshot.key,childSnapshot.child("cor").val(),latlngRegiao]);
    });
    console.log(regioes);
    var i;
    for(i=0; i < regioes.length; i++){
        regiao = L.polygon(regioes[i][3], {nome:regioes[i][0], code:regioes[i][1], color:regioes[i][2]}).addTo(map);
    }
});