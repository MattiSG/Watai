email	: '#request_email',
captcha	: '#recaptcha_response_field',

askFor: function requestPasswordFor(address) {
	return	this.setEmail(address)()	// (yes, this syntax is ugly and will be fixed in an upcoming release, see issue #99)
				.then(driver.submit.bind(driver));
}
