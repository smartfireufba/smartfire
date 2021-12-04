var areasIsolamento = []
var raio;
var nome;
var cor;
firebase.database().ref('areaIsolamento/').on('value', function (dataSnapshot) {
    dataSnapshot.forEach(function (childSnapshot) {
        //regiao
        cor = childSnapshot.child("cor").val();
        nome = childSnapshot.child("nome").val();
        raio = parseInt(childSnapshot.child("raio").val());
        var coord = [2];
        coord[0] = childSnapshot.child("coordenadas").child("lat").val();
        coord[1] = childSnapshot.child("coordenadas").child("lng").val();
        areasIsolamento.push([L.circle(coord, raio,{color: cor, nome:nome, code:childSnapshot.key}).on('click',function(e) {
            if(selected){
                if(removed != undefined){
                    map.addLayer(removed);
                    removed = undefined;
                }
                areaIsolamento = e.target;
            }
        }).addTo(map).bindPopup(nome)]);
    });
});

console.log(areasIsolamento);