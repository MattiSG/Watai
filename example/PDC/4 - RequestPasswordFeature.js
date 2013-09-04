description: 'A password reset request should be protected by a captcha',

scenario: [
	LoginWidget.open(),
	LoginWidget.requestPassword(),
	{ 'PasswordRequestWidget.captcha': true },
	PasswordRequestWidget.askFor(badEmail),	// check that the captcha is here even after having tried to ask for a reset
	{ 'PasswordRequestWidget.captcha': true }
]
