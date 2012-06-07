module.exports = function(TR) {
	return new TR.Widget("login", {
		elements: {
			email:		{ id: "login_email" },
			password:	{ id: "login_password" },
			loginSubmit:{ xpath: "//input[@type='submit'][1]" },
			loginPage:	{ linkText: "Connexion" }
		},
		
		open: function open() {
			this.loginPage.toSeleniumElement().click();
		},
		
		login: function login(email, password) {
			this.email.toSeleniumElement().sendKeys(email);
			this.password.toSeleniumElement().sendKeys(password);
			this.loginSubmit.toSeleniumElement().click();
		}
	});
}
