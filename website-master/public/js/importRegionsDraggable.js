var regioes = []
var latlngRegiao = []
var arrayAcessos = []
var mapAcessos = []
var regiao;
var selected;

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
        arrayAcessos = []
        childSnapshot.child("acessos").forEach(function (childSnapshot1) {
            var coord = [2];
            childSnapshot1.forEach(function (childSnapshot2) {
                if(childSnapshot2.key == "lat"){
                    coord[0] = childSnapshot2.val();
                }else{
                    coord[1] = childSnapshot2.val();
                }
            });
            arrayAcessos.push((L.marker(coord, {icon: iconAcesso, nome: childSnapshot1.key, lastpos: coord}).bindPopup(childSnapshot1.key)));
        });
        regioes.push([childSnapshot.child("nome").val(),childSnapshot.key,childSnapshot.child("cor").val(),latlngRegiao,arrayAcessos]);
    });
    console.log(regioes);
    var i;
    for(i=0; i < regioes.length; i++){
        regiao = L.polygon(regioes[i][3], {nome:regioes[i][0], code:regioes[i][1], color:regioes[i][2],acessos:regioes[i][4]}).on('click',function (e) {
            if(importRegionsAcessos){
                if(selected != undefined){
                    selected.options.acessos.forEach(function(e) {
                        map.removeLayer(e);
                    })
                }
                e.target.options.acessos.forEach(function(ev,i) {
                    ev.options.draggable = true;
                    ev.on('dragstart',function(evi) {
                        e.target.options.acessos[i].lastpos = evi.latlng;
                    }).on('dragend',function(evi) {
                        if(!e.target.contains(evi.target.getLatLng())){
                            evi.target.setLatLng(evi.target.options.lastpos);
                        }else{
                            evi.target.options.lastpos = evi.target.getLatLng()
                        }
                    }).addTo(map);
                })
                selected = e.target;
            }
        }).addTo(map);
        
    }
});

map.on('click', function(ev){
    if(importRegionsAcessos){
        if(!isMarkerOnPolygons(ev)){
            if(selected != undefined){
                selected.options.mapIcons.forEach(function(e) {
                    map.removeLayer(e);
                })
            }
        } 
    }
});


var iconAcesso = L.icon({
    iconUrl: './img/acesso.png',
    iconSize: [30, 30],
    iconAnchor: [10, 10],
    popupAnchor: [10, -10],
});

function isMarkerOnPolygons (ev) {
    var layerx = []
    map.eachLayer(function(layer){
        if(layer instanceof L.Polygon && !(layer instanceof L.Rectangle) ){
            layerx.push(layer);
        }
    });
    var i;
    for(i = 0; i<layerx.length;i++){
        var contained = layerx[i].contains(ev.latlng);
        if (contained) return true;
    }
    return false;
}

function isMarkerOnLayer (ev,layer) {
    var contained = layer.contains(ev.latlng);
    if (contained) return true;
    return false;
  } 