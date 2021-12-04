var alarmesvar = [];
var appAlarmesArray = [];
var alarmisOn;
var IconAlarmes = [];
var alertasRef;
var appAlertasRef;

alertasRef = firebase.database().ref('alertas/');
alertasRef.on('value',function (dataSnapshot) {
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
                                    codeAlarme:dataSnapshot4.key,
                                    data: dataSnapshot4.child("data").val(),
                                    hora: dataSnapshot4.child("hora").val(),
                                    regiao:"0",
                                    codeRegiao: dataSnapshot1.key,
                                    ponto:"0",
                                    codeIcon: dataSnapshot2.key,
                                    coordenadas:"0",
                                    status:"ON",
                                    gas:dataSnapshot4.child("gas").val(),
                                    tem:dataSnapshot4.child("tem").val(),
                                    hum:dataSnapshot4.child("hum").val()
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
            alarme.coordenadas={
                lat:dataSnapshot.child("regioes").child(alarme.codeRegiao).child("pontosMonitoramento").child(alarme.codeIcon).child("coordenadas").child("lat").val(),
                lng:dataSnapshot.child("regioes").child(alarme.codeRegiao).child("pontosMonitoramento").child(alarme.codeIcon).child("coordenadas").child("lng").val()
            }
            addRow(alarme);
            alarmeModal(alarme);
            $(`#${alarme.codeAlarme}`).on("click",function(){
                turnOffAlarme(alarme);
            });
        });
    });
    document.getElementById('alertas-counter').innerHTML = alarmesvar.length + appAlarmesArray.length;
	document.getElementById('alertas-counter-sub').innerHTML = alarmesvar.length + appAlarmesArray.length;
});

appAlertasRef = firebase.database().ref('aplicativo/');
appAlertasRef.on('value',function (dataSnapshot) {
    dataSnapshot.forEach(function (dataSnapshot1) {
        //Cod. de Alarme
        if(dataSnapshot1.child("status").val() == "ON"){
            var appAlarme = {
                classificacao: "Alerta em Aplicativo",
                code: dataSnapshot1.key,
                data: dataSnapshot1.child("data").val(),
                hora: dataSnapshot1.child("hora").val(),
                lat: dataSnapshot1.child("lat").val(),
                lng: dataSnapshot1.child("lng").val(),
                telefone: dataSnapshot1.child("tel").val(),
                status: dataSnapshot1.child("status").val()
            };
            console.log(appAlarme)
            appAlarmesArray.push(appAlarme);
        }
    });
    appAlarmesArray.forEach(function(appAlarme) {
        addAppRow(appAlarme);
        $(`#${appAlarme.code}`).on("click",function(){
            turnOffAppAlarme(appAlarme);
        });
    });
    document.getElementById('alertas-counter').innerHTML = alarmesvar.length + appAlarmesArray.length;
	document.getElementById('alertas-counter-sub').innerHTML = alarmesvar.length + appAlarmesArray.length;
});

function alarmeModal(alarme) {
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
                <h5 class="monit-titulo-left" style ="color:#dc3545;">CLASSIFICAÇÃO: ${alarme.classificacao}</h5>\
                <h6 class="monit-titulo-left">DATA: ${alarme.data}</h6>\
                <h6 class="monit-titulo-left">HORA: ${alarme.hora}</h6>\
                <h6 class="monit-titulo-left">REGIÃO: ${alarme.regiao}</h6>\
                <h6 class="monit-titulo-left">PONTO: ${alarme.ponto}</h6>\
            </div>\
        </div>\
        </br>\
        `,
        animation: 'zoomIn',
    });
    document.getElementById('alertas-counter').innerHTML = IconAlarmes.length+appAlarmesArray.length;
	document.getElementById('alertas-counter-sub').innerHTML = IconAlarmes.length+appAlarmesArray.length;
    alarmModal.open();
}

function addRow (alarme) {
    document.querySelector('#alertas-container').insertAdjacentHTML(
    'afterbegin',
    `
    <div class="card-body" style="background-color: #ffffff; border-radius: 25px; margin-top: 40px;margin-bottom: 40px;">
    <div class="row">
        <div class="col-md-4">
            <div class="card mb-3">
                <div class="card-body">
                    <div class="icon-right text-secondary">
                        <i class="fas fa-map-marker-alt"></i>
                    </div>
                    <div class="number-right text-right">
                        <h6 style="text-align: left;" class="bold text-secondary">Ponto de Monitoramento</h6>
                        <h4 style="text-align: left;" id="mp_nomeIcon" class="text-secondary card-title">${alarme.ponto}</h4>
                    </div>
                    <div class="progress-text text-secondary">
                        <span id="mp_nomeRegion" class="float-left">
                            <medium>Região: ${alarme.regiao}</medium>
                        </span>
                        </br>
                        <span id="mp_codeRegion" class="float-left">
                            <medium>Cód. de Região: ${alarme.codeRegiao}</medium>
                        </span>
                        </br>
                        <span id="mp_codeIcon" class="float-left">
                            <medium>Cód. Monitoramento: ${alarme.codeIcon}</medium>
                        </span> 
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card mb-3">
                <div class="card-body">
                    <div class="icon-right text-secondary">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="number-right text-right">
                        <h6 style="text-align: left;" class="bold text-secondary">Status de Alerta: </h6>
                        <h3 id="power-text" style="text-align: left;" class="text-secondary card-title">${alarme.status}</h3>
                    </div>
                    <div class="button">
                        <button id="${alarme.codeAlarme}" class="turn-off-button btn">Turn OFF</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card mb-3">
                <div class="card-body">
                    <div class="icon-right text-secondary">
                        <i class="fas fa-exclamation-circle"></i>
                    </div>
                    <div class="number-right text-right">
                        <h6 style="text-align: left;" class="bold text-secondary">Classificação: </h6>
                        <h3 id="periodo" class="card-title" style="text-align: left;color:#dc3545">${alarme.classificacao}</h3>
                    </div>
                    <div class="progress-text text-secondary">
                        <span id="mp_codeAlarme" class="float-left">
                            <medium>Cód.: ${alarme.codeAlarme}</medium>
                        </span>
                        </br>
                        <span id="mp_data" class="float-left">
                            <medium>Data: ${alarme.data}</medium>
                        </span>
                        </br>
                        <span id="mp_hora" class="float-left">
                            <medium>Hora: ${alarme.hora}</medium>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="row">
        <div class="col-md-4">
            <div class="card mb-3">
                <div class="card-body">
                    <div class="icon-left text-secondary">
                        <i class="fas fa-fire"></i>
                    </div>
                    <div class="number-right text-right">
                        <h6 class="bold text-secondary">Última Medida de Gás</h6>
                        <h3 id="gas-media" class="card-title text-warning bold">${alarme.gas}ppm</h3>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card mb-3">
                <div class="card-body">
                    <div class="icon-left text-secondary">
                        <i class="fas fa-thermometer-half"></i>
                    </div>
                    <div class="number-right text-right">
                        <h6 class="bold text-secondary">Última Medida de Temperatura</h6>
                        <h3 id="tem-media" class="card-title text-primary bold">${alarme.tem}ºC</h3>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card mb-3">
                <div class="card-body">
                    <div class="icon-left text-secondary">
                        <i class="fas fa-tint"></i>
                    </div>
                    <div class="number-right text-right">
                        <h6 class="bold text-secondary">Última Medida de Umidade</h6>
                        <h3 id="umd-media" class="card-title text-bubblegum bold">${alarme.hum}%</h3>
                    </div>
                </div>
            </div>
        </div>
    </div>
    </div>
    `      
    )
}

function addAppRow (appAlarme) {
    document.querySelector('#alertas-container').insertAdjacentHTML(
    'afterbegin',
    `
    <div class="card-body" style="background-color: #ffffff; border-radius: 25px; margin-top: 40px;margin-bottom: 40px;">
    <div class="row">
        <div class="col-md-4">
            <div class="card mb-3">
                <div class="card-body">
                    <div class="icon-right text-secondary">
                        <i class="fas fa-map-marker-alt"></i>
                    </div>
                    <div class="number-right text-right">
                        <h6 style="text-align: left;" class="bold text-secondary">Ponto de Alarme em Aplicativo</h6>
                        <a href='home.html'>
                            <h5 style="text-align: left;" id="mp_nomeIcon" class="text-secondary card-title">Visualizar no Mapa</h5>
                        </a>
                    </div>
                    <div class="progress-text text-secondary">
                        <span id="mp_nomeRegion" class="float-left">
                            <medium>Telefone: ${appAlarme.telefone}</medium>
                        </span>
                        </br>
                        <span id="mp_codeRegion" class="float-left">
                            <medium>Latitude: ${appAlarme.lat}</medium>
                        </span>
                        </br>
                        <span id="mp_codeIcon" class="float-left">
                            <medium>Longitude: ${appAlarme.lng}</medium>
                        </span> 
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card mb-3">
                <div class="card-body">
                    <div class="icon-right text-secondary">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="number-right text-right">
                        <h6 style="text-align: left;" class="bold text-secondary">Status de Alerta: </h6>
                        <h3 id="power-text" style="text-align: left;" class="text-secondary card-title">${appAlarme.status}</h3>
                    </div>
                    <div class="button">
                        <button id="${appAlarme.code}" class="turn-off-button btn">Turn OFF</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card mb-3">
                <div class="card-body">
                    <div class="icon-right text-secondary">
                        <i class="fas fa-exclamation-circle"></i>
                    </div>
                    <div class="number-right text-right">
                        <h6 style="text-align: left;" class="bold text-secondary">Classificação: </h6>
                        <h3 id="periodo" class="card-title" style="text-align: left;color:#dc3545">${appAlarme.classificacao}</h3>
                    </div>
                    <div class="progress-text text-secondary">
                        <span id="mp_codeAlarme" class="float-left">
                            <medium>Cód.: ${appAlarme.code}</medium>
                        </span>
                        </br>
                        <span id="mp_data" class="float-left">
                            <medium>Data: ${appAlarme.data}</medium>
                        </span>
                        </br>
                        <span id="mp_hora" class="float-left">
                            <medium>Hora: ${appAlarme.hora}</medium>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
    </div>
    `      
    )
}
  
function removeRow (input) {
    input.parentNode.remove()
}

function turnOffAlarme(alarme) {
    var r = confirm("Deseja Finalizar o chamado e Desligar o Alerta?");
    if (r == false) {
        return;
    }else{
        var obs = prompt("Deseja registrar algum Comentário ou Observação?");
    }
    if(obs!=null&&obs!=""){
        firebase.database().ref('alertas/'+alarme.codeRegiao+"/"+alarme.codeIcon+"/"+alarme.classificacao+"/"+alarme.codeAlarme+"/observacao").set(obs);
    }
    alertasRef.off('value');
    firebase.database().ref('alertas/'+alarme.codeRegiao+"/"+alarme.codeIcon+"/status").set("OFF");
    firebase.database().ref('alertas/'+alarme.codeRegiao+"/"+alarme.codeIcon+"/"+alarme.classificacao+"/"+alarme.codeAlarme+"/status").set("OFF");
    firebase.database().ref('alertas/'+alarme.codeRegiao+"/"+alarme.codeIcon+"/"+alarme.classificacao+"/"+alarme.codeAlarme+"/dataFim").set(dataHora().dataStr);
    firebase.database().ref('alertas/'+alarme.codeRegiao+"/"+alarme.codeIcon+"/"+alarme.classificacao+"/"+alarme.codeAlarme+"/horaFim").set(dataHora().hora);
    window.location.href = "./home.html"
}

function turnOffAppAlarme(appAlarme) {
    var r = confirm("Deseja Finalizar o chamado e Desligar o Alerta?");
    if (r == false) {
        return;
    }else{
        var obs = prompt("Deseja registrar algum Comentário ou Observação?");
    }
    if(obs!=null&&obs!=""){
        firebase.database().ref('aplicativo/'+appAlarme.code+"/observacao").set(obs);
    }
    appAlertasRef.off('value');
    firebase.database().ref('aplicativo/'+appAlarme.code+"/status").set("OFF");
    firebase.database().ref('aplicativo/'+appAlarme.code+"/dataFim").set(dataHora().dataStr);
    firebase.database().ref('aplicativo/'+appAlarme.code+"/horaFim").set(dataHora().hora);
    window.location.href = "./home.html"
}

function dataHora() {
    var data = new Date();
    //2013-03-25 T 21:30:44
    var dd = String(data.getDate()).padStart(2, '0');
    var mm = String(data.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = data.getFullYear();
    var hh = String(data.getHours()).padStart(2, '0');
    var mn = String(data.getMinutes()).padStart(2, '0');
    var ss = String(data.getSeconds()).padStart(2, '0');
    let dataStr = yyyy + "-" + mm + "-" + dd;
    let hora = hh + ':' + mn + ':' + ss;
    return{
        dataStr,
        hora
    }
}
