openLink			: { linkText: 'Connexion' },
email				: '#login_email',
password			: '#login_password',
requestPasswordLink	: 'form .details a',

login: function login(email, password) {
	return	this.setEmail(email)()	// (yes, this syntax is ugly and will be fixed in an upcoming release, see issue #99)
				.then(this.setPassword(password))
				.then(driver.submit.bind(driver));
}
