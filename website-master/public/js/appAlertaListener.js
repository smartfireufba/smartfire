var appAlertaMarkers = [];
var alarmModal;

firebase.database().ref('aplicativo/').on('value',function (dataSnapshot) {
    dataSnapshot.forEach(function (dataSnapshot1) {
        //Cod. de Alarme
        if(dataSnapshot1.child("status").val() == "ON"){
            appAlertaMarkers.push(L.marker([dataSnapshot1.child("lat").val(), dataSnapshot1.child("lng").val()],
            {
                icon: alarmeIcon,
                classificacao: "Alerta em Aplicativo",
                code: dataSnapshot1.key,
                data: dataSnapshot1.child("data").val(),
                hora: dataSnapshot1.child("hora").val(),
                lat: dataSnapshot1.child("lat").val(),
                lng: dataSnapshot1.child("lng").val(),
                telefone: dataSnapshot1.child("tel").val(),
                status: dataSnapshot1.child("status").val()
            }).on('click',function(e) {
                alarmModal.open();
            }).addTo(map).bindPopup("Alerta em Aplicativo"));
            alarmeModal("Alerta em Aplicativo",dataSnapshot1.child("data").val(), dataSnapshot1.child("hora").val(),dataSnapshot1.child("lat").val(), dataSnapshot1.child("lng").val(),dataSnapshot1.child("tel").val(), dataSnapshot1.child("status").val())
        }
    });
});

function alarmeModal(classificacao,data,hora,lat,lng,telefone,status) {
    alarmModal=new jBox('Modal', {
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
                <h6 class="monit-titulo-left">TELEFONE: ${telefone}</h6>\
                <h6 class="monit-titulo-left">DATA: ${data}</h6>\
                <h6 class="monit-titulo-left">HORA: ${hora}</h6>\
                <h6 class="monit-titulo-left">LOCALIZAÇÃO</h6>\
                <h6 class="monit-titulo-left">LAT: ${lat}</h6>\
                <h6 class="monit-titulo-left">LNG: ${lng}</h6>\
            </div>\
        </div>\
        </br>\
        <div style="text-align:center;">\
            <a href="alertasAtivos.html">\
                <button style="width: 100%;margin-top:5%;" class="btn btn-success" type="button" id="dropdownMenuButton">VISUALIZAR NO SISTEMA</button>\
            </a>\
        </div>\
        `,
        animation: 'zoomIn',
    });
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
