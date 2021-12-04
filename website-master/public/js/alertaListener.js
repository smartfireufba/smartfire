var alarmesvar = [];
var alarmisOn;
var IconAlarmes = [];

firebase.database().ref('alertas/').on('value',function (dataSnapshot) {
    dataSnapshot.forEach(function (dataSnapshot1) {
        //regiao
        dataSnapshot1.forEach(function (dataSnapshot2) {
            //cod. Monitoramento
            if(dataSnapshot2.child("status").val() == "ON"){
                dataSnapshot2.forEach(function (dataSnapshot3) {
                    //tipo de Alarme
                    if(dataSnapshot3.key!="status"){
                        dataSnapshot3.forEach(function (dataSnapshot4) {
                            //Cod. de Alarme
                            if(dataSnapshot4.child("status").val() == "ON"){
                                alarmisOn = true;
                                IconAlarmes.push(dataSnapshot2.key);
                                var alarme = {
                                    classificacao: dataSnapshot3.key,
                                    data: dataSnapshot4.child("data").val(),
                                    hora: dataSnapshot4.child("hora").val(),
                                    regiao:"0",
                                    codeRegiao: dataSnapshot1.key,
                                    ponto:"0",
                                    codeIcon: dataSnapshot2.key
                                };
                                alarmesvar.push(alarme);
                            }
                        });
                    }
                });
            }
        });
    });
    alarmesvar.forEach(function(alarme) {
        firebase.database().ref().once('value').then(function (dataSnapshot) {
            alarme.regiao=dataSnapshot.child("regioes").child(alarme.codeRegiao).child("nome").val();
            alarme.ponto=dataSnapshot.child("regioes").child(alarme.codeRegiao).child("pontosMonitoramento").child(alarme.codeIcon).child("nome").val();

            alarmeModal(alarme.classificacao,alarme.data,alarme.hora,alarme.regiao,alarme.ponto);
        });
    });
});

function alarmeModal(classificacao,data,hora,regiao,ponto) {
    var alarmModal=new jBox('Modal', {
        title: '<h3 class="monit-titulo-left">ALERTA !</h3>',
        content: `\
        <div class="clearfix">\
            <div style="float:left;">\
                <img style="width: 250px;height: 250px;" src="./img/alerta.png">\
            </div>\
            <div class ="card-body" style="float:right;">\
                <h5 class="monit-titulo-left" style="color:#ffc107;">UM ALERTA FOI DETECTADO!</h5>\
                </br>\
                <h5 class="monit-titulo-left" style ="color:#dc3545;">CLASSIFICAÇÃO: ${classificacao}</h5>\
                <h6 class="monit-titulo-left">DATA: ${data}</h6>\
                <h6 class="monit-titulo-left">HORA: ${hora}</h6>\
                <h6 class="monit-titulo-left">REGIÃO: ${regiao}</h6>\
                <h6 class="monit-titulo-left">PONTO: ${ponto}</h6>\
            </div>\
        </div>\
        </br>\
        <div style="text-align:center;">\
            <a href="alertasAtivos.html">\
                <button style="width: 100%;margin-top:5%;" class="btn btn-success" type="button" id="dropdownMenuButton">DIRECIONAR NO SISTEMA</button>\
            </a>\
        </div>\
        `,
        animation: 'zoomIn',
    });
    if(typeof map !== 'undefined'){
        map.eachLayer(function(layer){
            if(layer instanceof L.Marker && IconAlarmes.includes(layer.options.codeIcon)){
                layer.setIcon(alarmeIcon);
            }
        });
    }
    document.getElementById('alertas-counter').innerHTML = IconAlarmes.length + appAlertaMarkers.length;
	document.getElementById('alertas-counter-sub').innerHTML = IconAlarmes.length + appAlertaMarkers.length;
    alarmModal.open();
}

if(typeof map !== 'undefined'){
    var alarmeIcon = L.icon({
        iconUrl: './img/alerta.png',
        iconSize: [35, 35],
        iconAnchor: [15, 15],
        popupAnchor: [2, -14]
    });
}
