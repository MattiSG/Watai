{
	elements: {
		email	: { id: 'request_email' },
		captcha	: { id: 'recaptcha_response_field' }
	},

	askFor: function(address) {
		return	this.setEmail(address)()
					.then(driver.submit.bind(driver));
	}
}
