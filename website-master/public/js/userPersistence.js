firebase.auth().onAuthStateChanged(function(user) {
	if (!user) {
		// No user is signed in.
		window.location.href = "./index.html ";
	} else {
		/*firebase.database().ref(`users/${user.uid}`).on('value', function(snapshot) {
			$('#userDropdown').html(`${snapshot.val().nome}     <i class="fas fa-user fa-fw"></i>`)
		});*/
		// User is signed in.
	}
});