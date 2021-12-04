//Import Regions
var regioes = []
var latlngRegiao = []
var arrayAcessos = []
var arrayMonit = []
var mapAcessos = []
var regiao;
var selected;
//Import Markers
var monitoramento = []
var coord = []
var mark;

//Modals
var modal;

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
        arrayMonit = []
        childSnapshot.child("pontosMonitoramento").forEach(function (childSnapshot1) {
            arrayMonit.push(childSnapshot1.key);
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
            arrayAcessos.push((L.marker(coord, {icon: iconAcesso, nome: childSnapshot1.key}).bindPopup(childSnapshot1.key)));
        });
        regioes.push([childSnapshot.child("nome").val(),childSnapshot.key,childSnapshot.child("cor").val(),latlngRegiao,arrayAcessos,arrayMonit]);
    });
    console.log(regioes);
    var i;
    for(i=0; i < regioes.length; i++){
        regiao = L.polygon(regioes[i][3], {nome:regioes[i][0], code:regioes[i][1], color:regioes[i][2],acessos:regioes[i][4], monitoramentos:regioes[i][5]}).on('click',function (e) {
            if(selected != undefined){
                selected.options.acessos.forEach(function(e) {
                    map.removeLayer(e);
                })
            }
            e.target.options.acessos.forEach(function(ev) {
                ev.addTo(map);
            })
            selected = e.target;
            openModalRegiao(e.target.options);
        }).addTo(map);
    }
});

map.on('click', function(ev){
    if(!isMarkerOnPolygons(ev)){
        if(selected != undefined){
            selected.options.acessos.forEach(function(e) {
                map.removeLayer(e);
            })
        }
        if(modal!=undefined){
            modal.close();
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

//Import Markers

firebase.database().ref('regioes/').once('value').then(function (dataSnapshot) {
    dataSnapshot.forEach(function (childSnapshot) {
        //codeRegiao
        childSnapshot.child("pontosMonitoramento").forEach(function (childSnapshot1) {
        //codePontoMonitoramento
        childSnapshot1.child("acesso").val();
        childSnapshot1.child("status").val();
        coord = []
        coord[0] = childSnapshot1.child("coordenadas").child("lat").val();
        coord[1] = childSnapshot1.child("coordenadas").child("lng").val();
        /*var gasArr = [];
        var gas;
        childSnapshot1.child("dados").child("Gas Meter").forEach(function (gasDataSnapshot) {
            gasDataSnapshot.forEach(function(gasData) {
                gasArr.push(gas = {data:gasDataSnapshot.key,hora:gasData.key,value:gasData.val()});
            });
        });*/
        monitoramento.push(
        L.marker(coord,
        {
            nome:childSnapshot1.child("nome").val(),
            code:childSnapshot.key,
            nomeRegiao:childSnapshot.child("nome").val(),
            posicaoInicial:coord,
            codeIcon: childSnapshot1.key,
            status:childSnapshot1.child("status").val(),
            acesso:childSnapshot1.child("acesso").val(),
            //gas:gasArr[gasArr.length-1]
        }).addTo(map).on('click',function(e) {
            localStorage.setItem("codeRegiao",e.target.options.code);
            localStorage.setItem("nomeRegiao",e.target.options.nomeRegiao);
            localStorage.setItem("codeIcone",e.target.options.codeIcon);
            localStorage.setItem("nomeIcone",e.target.options.nome);
            openModalPonto(e.target.options);
        }))
        });
        
    });
    console.log(monitoramento);
    if(alarmisOn){
        map.eachLayer(function(layer){
            if(layer instanceof L.Marker && IconAlarmes.includes(layer.options.codeIcon)){
                layer.setIcon(alarmeIcon);
            }
        });
    }
});
function openModalPonto(marker) {
    if(modal!=undefined){
        modal.close();
    }
    modal=new jBox('Modal', {
        title: `<h3 class="monit-titulo-left">Ponto de Monitoramento</h3>`,
        content: `\
        <div class="clearfix">\
            <div style="float:left;">\
                <img style="width: 200px;height: 200px;" src="./img/modalPonto.jpg">\
            </div>\
            <div class ="card-body" style="float:right;padding-top: 0px;">\
                <h5 class="monit-titulo-left" style="color:#2a7fcc;">${marker.nome}</h5>\
                <h6 class="monit-titulo-left" style ="color:#ffc107;">Região: ${marker.nomeRegiao}</h6>\
                </br>\
                <h6 class="monit-titulo-left">Cód. Região: ${marker.code}</h6>\
                <h6 class="monit-titulo-left">Cód. Monitoramento: ${marker.codeIcon}</h6>\
                <h6 class="monit-titulo-left">Melhor Acesso: ${marker.acesso}</h6>\
                <h6 class="monit-titulo-left">Status: ${marker.status}</h6>\
                </br>\
                <h6 class="monit-titulo-left">Coordenadas:</h6>\
                <h6 class="monit-titulo-left">Lat: ${marker.posicaoInicial[0]}</h6>\
                <h6 class="monit-titulo-left">Lng: ${marker.posicaoInicial[1]}</h6>\
            </div>\
        </div>\
        <div style="text-align:center;">\
            <a href="monitoramentoPonto.html">\
                <button style="width: 100%;margin-top:5%;" class="btn btn-success" type="button" href="dropdownMenuButton">VISUALIZAR MONITORAMENTO</button>\
            </a>\
        </div>\
        `,
        animation: 'zoomIn',
        overlay:false,
        position: { x: 'right', y: 'center' }
    });
    modal.open();
}

function openModalRegiao(regiao) {
    if(modal!=undefined){
        modal.close();
    }
    modal=new jBox('Modal', {
        title: `<h3 class="monit-titulo-left">Região</h3>`,
        content: `\
        <div class="clearfix">\
            <div style="float:left;">\
                <img style="width: 200px;height: 200px;" src="./img/region.jpg">\
            </div>\
            <div class ="card-body" style="float:right;padding-top: 0px;">\
                <h5 class="monit-titulo-left" style="color:#2a7fcc;">${regiao.nome}</h5>\
                </br>\
                <h6 class="monit-titulo-left">Cód. Região: ${regiao.code}</h6>\
                <h6 class="monit-titulo-left">Cor: ${regiao.color}</h6>\
                <h6 class="monit-titulo-left">Nº de Monitoramentos: ${regiao.monitoramentos.length}</h6>\
                <h6 class="monit-titulo-left">Nº de Acessos: ${regiao.acessos.length}</h6>\
            </div>\
        </div>\
        <div style="text-align:center;">\
            <a href="#">\
                <button style="width: 100%;margin-top:5%;" class="btn btn-success" type="button" href="dropdownMenuButton">VISUALIZAR MONITORAMENTO EM REGIÃO</button>\
            </a>\
        </div>\
        `,
        animation: 'zoomIn',
        overlay:false,
        position: { x: 'right', y: 'center' }
    });
    modal.open();
}