module.exports = function(TR, driver) {
	return new TR.Widget("login", {
		elements: {
			email:		{ id: "login_email" },
			password:	{ id: "login_password" },
			loginSubmit:{ xpath: "//input[@type='submit'][1]" },
			loginPage:	{ linkText: "Connexion" }
		},
		
		open: function open() {
			this.loginPage.click();
		},
		
		login: function login(email, password) {
			this.email = email;
			this.password = password;
			this.loginSubmit.click();
		}
	}, driver);
}
