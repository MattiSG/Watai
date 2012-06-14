{
	description: 'A password request reset should be protected by a captcha',
	
	scenario: [
		LoginWidget.open,
		LoginWidget.requestPassword,
		PasswordRequestWidget.has, 'captcha',
		PasswordRequestWidget.askFor, badEmail,	// check that the captcha is here even after having tried to ask for a reset
		PasswordRequestWidget.has, 'captcha'
	]
}
