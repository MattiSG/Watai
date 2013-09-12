openLink			: { linkText: 'Connexion' },
email				: '#login_email',
password			: '#login_password',
requestPasswordLink	: 'form .details a',

login: function login(email, password) {
	return	this.setEmail(email)
				.then(this.setPassword(password))
				.then(driver.submit.bind(driver));
}
