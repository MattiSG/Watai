email	: '#request_email',
captcha	: '#recaptcha_response_field',

askFor: function requestPasswordFor(address) {
	return	this.setEmail(address)
				.then(driver.submit.bind(driver));
}
