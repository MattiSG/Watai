description: 'A password reset request should be protected by a captcha',

scenario: [
	LoginComponent.open(),
	LoginComponent.requestPassword(),
	{ 'PasswordRequestComponent.captcha': true },
	PasswordRequestComponent.askFor(badEmail),	// check that the captcha is here even after having tried to ask for a reset
	{ 'PasswordRequestComponent.captcha': true }
]
