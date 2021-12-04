// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
var firebaseConfig = {
apiKey: "AIzaSyAe7fBjytla1_5PFx63C5C-Z7sHqe9iXy8",
authDomain: "website-ea996.firebaseapp.com",
projectId: "website-ea996",
storageBucket: "website-ea996.appspot.com",
messagingSenderId: "737622308582",
appId: "1:737622308582:web:b7c4211dbead4a3aee2d27",
measurementId: "G-C6VL70GL7C"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig)

//sign up

$("#close-sidebar").on("click",function(){
	firebase.auth().signOut();
});
$("#log-off").on("click",function(){
	firebase.auth().signOut();
});
$("#btn-signup").on("click",function(){
	var email = $("#signup-email").val();
    var password = $("#signup-password").val();

    // var validateEmail = true;
	var validaCampos = validateInputsRegister("alerta-register", "#signup-email", "#signup-password", "#repeat-password");
	console.log(validaCampos)
    if (validaCampos) {
        // if (validaCampos && password != "") {
		firebase.auth().createUserWithEmailAndPassword(email, password).then((user) => {
			// Signed in
			// ...
            //window.location.href = "./home.html"
            alert("Usuário Criado com sucesso\nE-mail:"+email)
            window.location.href = "./home.html"
		}).catch((error) => {
			var errorCode = error.code;
			var errorMessage = error.message;
			$("#alerta-register").show();
            document.getElementById("alerta-register").innerHTML = errorMessage;
			// ..
		});
    }
});

$("#btn-signin").click(function() {

    var email = $("#login-email").val();
    var password = $("#login-password").val();

    // var validateEmail = true;
    var validaCampos = validateInputsLogin("alerta-login", "#login-email", "#login-password");
    if (validaCampos) {
        // if (validaCampos && password != "") {
        firebase.auth().signInWithEmailAndPassword(email, password).then((user) => {
			window.location.href = "./home.html"
		}).catch((error) => {
            var errorCode = error.code;
            var errorMenssage = error.message;
            $("#alerta-login").show();
            document.getElementById("alerta-login").innerHTML = errorMenssage;
        });
    }
    // else {
    //     window.alert("Preencha os campos ");
    // }
});

function validateInputsLogin(idAlerta, email, senha) {
    var validate = true;
    var mensagem = "";
    // email
    if ($(email).val().trim().match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/) == null) {
        validate = false;
        mensagem = "Email Inválido!";
        $("#"+idAlerta).show();
        document.getElementById(idAlerta).innerHTML = mensagem;
    }
    //senha
    else if ($(senha).val().trim() == '') {
        validate = false;
        mensagem = "Digite a Senha!";
        $("#"+idAlerta).show();
        document.getElementById(idAlerta).innerHTML = mensagem;
    }
    return validate;
}

function validateInputsRegister(idAlerta, email, senha, repitaSenha) {
    var validate = true;
    var mensagem = "";
    // email
    if ($(email).val().trim().match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/) == null) {
        validate = false;
        mensagem = "Email Inválido!";
        $("#"+idAlerta).show();
        document.getElementById(idAlerta).innerHTML = mensagem;
    }
    //senha
    else if ($(senha).val().trim() == '') {
        validate = false;
        mensagem = "Digite a Senha!";
        $("#"+idAlerta).show();
        document.getElementById(idAlerta).innerHTML = mensagem;
    }else if($(senha).val().trim().length < 6){
        validate = false;
        mensagem = "A senha deve ao menos 6 digitos!";
        $("#"+idAlerta).show();
        document.getElementById(idAlerta).innerHTML = mensagem;
    }else if($(senha).val().trim() != $(repitaSenha).val().trim()){
        validate = false;
        mensagem = "As senhas não correspondem!";
        $("#"+idAlerta).show();
        document.getElementById(idAlerta).innerHTML = mensagem;
    }

    return validate;
}