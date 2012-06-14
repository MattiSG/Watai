{
	elements: {
		email: { id: 'request_email' },
		captcha: { id: 'recaptcha_response_field' }
	},
	
	askFor: function(address) {
		this.email = address;
		return this.email.submit();
	}
}
