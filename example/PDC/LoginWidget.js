elements: {
	openLink			: { linkText: 'Connexion' },
	email				: { id: 'login_email' },
	password			: { id: 'login_password' },
	requestPasswordLink	: 'form .details a'
},

login: function login(email, password) {
	return	this.setEmail(email)()
				.then(this.setPassword(password))
				.then(driver.submit.bind(driver));
}
