var mp_codeRegiao = localStorage.getItem("codeRegiao")
var mp_nomeRegion = localStorage.getItem("nomeRegiao")
var mp_codeIcon = localStorage.getItem("codeIcone")
var mp_nomeIcon = localStorage.getItem("nomeIcone")
var periodo = "Últimos 5 minutos";
var array_periodo_gas = []
var power;
var dataAtual;
var lastClickTime = 0;
var i=0;
var myChart0;var myChart1;var myChart2;

var ctx0 = document.getElementById('myChart');
var ctx1 = document.getElementById('myChart1');
var ctx2 = document.getElementById('myChart2');

firebase.database().ref('regioes/'+mp_codeRegiao+"/pontosMonitoramento/"+mp_codeIcon+"/status").on('value', function (snapshot) {
    power = snapshot.val();
    document.getElementById('power-text').innerHTML = power;
    if(power == "OFF"){
        document.getElementById('power-button').innerHTML = "Turn On";
    }else if(power == "ON"){
        document.getElementById('power-button').innerHTML = "Turn OFF";
    }
});

function powerButton() {
    if(power == "OFF"){
        firebase.database().ref('regioes/'+mp_codeRegiao+"/pontosMonitoramento/"+mp_codeIcon+"/status").set("ON");
    }else if(power == "ON"){
        firebase.database().ref('regioes/'+mp_codeRegiao+"/pontosMonitoramento/"+mp_codeIcon+"/status").set("OFF");
    }
}

firebase.database().ref('regioes/'+mp_codeRegiao+"/pontosMonitoramento/"+mp_codeIcon+"/dados/Gas Meter").on('value', function (dataSnapshot) {
    var hora5mn= last5min().date;
    var array_hora = []
    var array_medidas_gas = []
    /*if(last5min.date.getHours()==23 && last5min.date.getMinutes()>55){
        dataSnapshot.child("Gas Meter").child(dataAtual().string).forEach(function (childSnapshot) {
            if(hora5mn-stringToDate(dataAtual().string,childSnapshot.key)<0){
                array_hora.push(childSnapshot.key);
                array_medidas.push(childSnapshot.val());
            }
        });
    }*/
    dataSnapshot.child(dataAtual().string).forEach(function (childSnapshot) {
        if(hora5mn-stringToDate(dataAtual().string,childSnapshot.key)<0){
            array_hora.push(childSnapshot.key);
            array_medidas_gas.push(childSnapshot.val());
        }
    });
    myChart0Update(array_hora,array_medidas_gas);
    document.getElementById('gas-min').innerHTML = "min :"+ Math.min.apply(null, array_medidas_gas)+"ppm";
    document.getElementById('gas-max').innerHTML = "max :"+Math.max.apply(null, array_medidas_gas)+"ppm";
    var soma = 0;
    array_medidas_gas.forEach(function (e) {
        soma = soma+parseInt(e);
    });
    soma = soma/array_medidas_gas.length
    document.getElementById('gas-media').innerHTML = soma.toFixed(1)+"ppm";
    document.getElementById("gas-bar").style.width = ((soma*100)/Math.max.apply(null, array_medidas_gas))+"%";
    
    array_hora = []
    array_medidas_gas = []
});

firebase.database().ref('regioes/'+mp_codeRegiao+"/pontosMonitoramento/"+mp_codeIcon+"/dados/Temperature").on('value', function (dataSnapshot) {
    var hora5mn= last5min().date;
    var array_hora = []
    var array_medidas_temperatura = []

    dataSnapshot.child(dataAtual().string).forEach(function (childSnapshot) {
        if(hora5mn-stringToDate(dataAtual().string,childSnapshot.key)<0){
            array_hora.push(childSnapshot.key);
            array_medidas_temperatura.push(childSnapshot.val());
        }
    });

    myChart1Update(array_hora,array_medidas_temperatura);
    document.getElementById('tem-min').innerHTML = "min :"+ Math.min.apply(null, array_medidas_temperatura)+"ºC";
    document.getElementById('tem-max').innerHTML = "max :"+Math.max.apply(null, array_medidas_temperatura)+"ºC";
    soma = 0;
    array_medidas_temperatura.forEach(function (e) {
        soma = soma+parseInt(e);
    });
    soma = soma/array_medidas_temperatura.length
    document.getElementById('tem-media').innerHTML = soma.toFixed(1)+"ºC";
    document.getElementById("tem-bar").style.width = ((soma*100)/Math.max.apply(null, array_medidas_temperatura))+"%";
    
    array_hora = []
    array_medidas_temperatura = []
});


firebase.database().ref('regioes/'+mp_codeRegiao+"/pontosMonitoramento/"+mp_codeIcon+"/dados/Humidity").on('value', function (dataSnapshot) {
    var hora5mn= last5min().date;
    var array_hora = []
    var array_medidas_umidade = []

    dataSnapshot.child(dataAtual().string).forEach(function (childSnapshot) {
        if(hora5mn-stringToDate(dataAtual().string,childSnapshot.key)<0){
            array_hora.push(childSnapshot.key);
            array_medidas_umidade.push(childSnapshot.val());
        }
    });
    myChart2Update(array_hora,array_medidas_umidade);
    document.getElementById('umd-min').innerHTML = "min :"+ Math.min.apply(null, array_medidas_umidade)+"%";
    document.getElementById('umd-max').innerHTML = "max :"+Math.max.apply(null, array_medidas_umidade)+"%";
    soma = 0;
    array_medidas_umidade.forEach(function (e) {
        soma = soma+parseInt(e);
    });
    soma = soma/array_medidas_umidade.length
    document.getElementById('umd-media').innerHTML = soma.toFixed(1)+"%";
    document.getElementById("umd-bar").style.width = ((soma*100)/Math.max.apply(null, array_medidas_umidade))+"%";

    array_hora = []
    array_medidas_umidade = []
});

document.getElementById('mp_nomeIcon').innerHTML = mp_nomeIcon;
document.getElementById('mp_nomeRegion').innerHTML = "Região: "+mp_nomeRegion;
document.getElementById('mp_codeRegion').innerHTML = "Cód. de Região: "+mp_codeRegiao;
document.getElementById('mp_codeIcon').innerHTML = "Cód. Monitoramento: "+mp_codeIcon;

$(".dropdown-menu a").click(function (e) {
    periodo = e.currentTarget.childNodes[0].data;
    document.getElementById('periodo').innerHTML = periodo;
});

function timeArray5min() {
    var array_periodo = []
    var i;
    var data = new Date();
    for(i=29;i>=0;i--){
        dataFim = data;
        dataFim.setSeconds(parseInt(String(dataFim.getSeconds()))-10)
        var hh = String(dataFim.getHours()).padStart(2, '0');
        var mn = String(dataFim.getMinutes()).padStart(2, '0');
        var ss = String(dataFim.getSeconds()).padStart(2, '0');
        array_periodo[i] = hh + ':' + mn + ':' + ss;
    }
    return array_periodo;
}

function last5min() {
    var data = new Date();
    data.setSeconds(parseInt(String(data.getSeconds()))-300)
    var hh = String(data.getHours()).padStart(2, '0');
    var mn = String(data.getMinutes()).padStart(2, '0');
    var ss = String(data.getSeconds()).padStart(2, '0');
    return {
        string: hh + ':' + mn + ':' + ss, 
        date: data
    };  

}

function dataAtual() {
    var data = new Date();
    var dd = String(data.getDate()).padStart(2, '0');
    var mm = String(data.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = data.getFullYear();
    return {
        string: yyyy + "-" + mm + "-" + dd, 
        date: data
    };  
}

function dataAnterior() {
    var data = new Date();
    data.setDate(parseInt(String(data.getDate()))-1);
    var dd = String(data.getDate()).padStart(2, '0');
    var mm = String(data.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = data.getFullYear();
    return {
        string: yyyy + "-" + mm + "-" + dd, 
        date: data
    };  
}

function stringToDate(data,hora) {
    var yyyy = data.substring(0,4);
    var mm = parseInt(data.substring(5,7))-1;
    var dd = data.substring(8,10);
    var hh = hora.substring(0,2);
    var mn = hora.substring(3,5);
    var ss = hora.substring(6,8);
    return new Date(yyyy,mm,dd,hh,mn,ss);
}

/*var dataInicio = new Date();
    var dataFim = new Date(2013,02,25,21,30,44);
    //2013-03-25 T 21:30:44
    var dd = String(dataFim.getDate()).padStart(2, '0');
    var mm = String(dataFim.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = dataFim.getFullYear();
    var hh = String(dataFim.getHours()).padStart(2, '0');
    var mn = String(dataFim.getMinutes()).padStart(2, '0');
    var ss = String(dataFim.getSeconds()).padStart(2, '0');
    var data = yyyy + "-" + mm + "-" + dd;
    var hora = hh + ':' + mn + ':' + ss;
    console.log(data);
    console.log(hora);
    if(dataInicio-dataFim>0){
        console.log("funfou");
    }
    console.log(dataFim-dataInicio);*/

//DATA E HORA
/*
var dataFim = new Date();
dataFim.setSeconds(parseInt(String(dataFim.getSeconds()))-array_periodo[i])
var dd = String(dataFim.getDate()).padStart(2, '0');
var mm = String(dataFim.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = dataFim.getFullYear();
var hh = String(dataFim.getHours()).padStart(2, '0');
var mn = String(dataFim.getMinutes()).padStart(2, '0');
var ss = String(dataFim.getSeconds()).padStart(2, '0');
var data = dd + '/' + mm + '/' + yyyy;
var hora = hh + ':' + mn + ':' + ss;
*/
/*
function setArrayInterval(){
    console.log(getTime(5,0));
}

setArrayInterval();
myVar = setInterval(setArrayInterval, 10000);
//clearTimeout(myVar);*/


/*var regioes = []
var latlngRegiao = [];
var regiao;

firebase.database().ref('regioes/').on('value', function (dataSnapshot) {
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
        regiao = L.polygon(regioes[i][3], {nome:regioes[i][0], code:regioes[i][1], color:regioes[i][2]});
        map.addLayer(regiao);
    }
});*/
function myChart0Update(hora,gas) {
    if(myChart0!=undefined){
        myChart0.destroy();
    }
    myChart0 = new Chart(ctx0, {
        type: 'line',
        data: {
            labels: hora,
            datasets: [{
                label: 'Medidas de Gás (ppm)',
                data: gas,
                backgroundColor: [
                    'rgba(255,193,7, 0.4)'
                ],
                borderColor: [
                    'rgba(255,193,7, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });    
}

function myChart1Update(hora,temperatura) {
    if(myChart1!=undefined){
        myChart1.destroy();
    }
    myChart1 = new Chart(ctx1, {
        type: 'line',
        data: {
            labels: hora,
            datasets: [{
                label: 'Temperatura (ºC)',
                data: temperatura,
                backgroundColor: [
                    'rgba(207,0,15, 0.2)'
                ],
                borderColor: [
                    'rgba(207,0,15, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
}

function myChart2Update(hora,umidade) {
    if(myChart2!=undefined){
        myChart2.destroy();
    }
    myChart2 = new Chart(ctx2, {
        type: 'line',
        data: {
            labels: hora,
            datasets: [{
                label: 'Umidade (%)',
                data: umidade,
                backgroundColor: [
                    'rgba(54, 162, 235, 0.2)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
}