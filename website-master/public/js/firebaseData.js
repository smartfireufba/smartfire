$("#firebase-data").click(function() {
    var cadastro = {
        bw: "Sara",
        c: "Santos1"
    };
    var updates = {};
    updates[`obras/sara/precadastro/domal`] = cadastro;
    firebase.database().ref().update(updates)
});

/*firebase.database().ref('obras/' + obra + '/precadastro/').on('value', function (dataSnapshot) {
    dataSnapshot.forEach(function (childSnapshot) {
        console.log(childSnapshot)
    })
});*/
/*firebase.database().ref('obras/sara/precadastro/domal').on('value', function (dataSnapshot) {
    console.log(dataSnapshot.key)
});
firebase.database().ref('obras/sara/precadastro/domal/c').on('value', function (dataSnapshot) {
    console.log(dataSnapshot.val())
});

/*firebase.database().ref('regioes/'+regiao+"/"+value).set(value, function(error) {
    if (error) {
        window.confirm("erro:" + error);
    } else {
        window.confirm("Salvo com Sucesso!");
    }
});*/