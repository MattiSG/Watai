{
	elements: {
		openLink:	{ linkText: 'Connexion' },
		email:		{ id: 'login_email' },
		password:	{ id: 'login_password' },
		requestPasswordLink:	{ css: 'form .details a' }
	},
	
	login: function login(email, password) {
		this.email = email;
		this.password = password;
		return this.password.submit();
	}
}
