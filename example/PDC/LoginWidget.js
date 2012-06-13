{
	elements: {
		email:		{ id: 'login_email' },
		password:	{ id: 'login_password' },
		loginSubmit:{ xpath: '//input[@type="submit"][1]' },
		loginPage:	{ linkText: 'Connexion' }
	},
	
	open: function open() {
		return this.loginPage.click();
	},
	
	login: function login(email, password) {
		this.email = email;
		this.password = password;
		return this.loginSubmit.click();
	}
}
