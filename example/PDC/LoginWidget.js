var LoginWidget = new Widget("login", {
	elements: {
		email:		{ id: "login_email" },
		password:	{ id: "login_password" },
		login:		{ xpath: "//input[@type='submit'][1]" },
		loginPage:	{ link: "Connexion" }
	},
	
	open: function open() {
		this.loginPage.click();
	},
	
	login: function login(email, password) {
		this.email.enter(email);
		this.password.enter(password);
		this.login.click();
	}
});
