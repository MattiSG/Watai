{
	elements: {
		email:		{ id: 'login_email' },
		password:	{ id: 'login_password' },
		loginSubmit:{ xpath: '//input[@type="submit"][1]' },
		loginLink:	{ linkText: 'Connexion' },
		forgottenPasswordLink:	{ css: 'form .details a' }
	},
	
	open: function open() {
		return this.loginLink.click();
	},
	
	login: function login(email, password) {
		this.email = email;
		this.password = password;
		return this.loginSubmit.click();
	},
	
	requestPassword: function requestPassword() {
		return this.forgottenPasswordLink.click();
	}
}
