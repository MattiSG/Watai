{
	elements: {
		firstName: { css: '#register #register_firstName' },
		lastName: { css: '#register #register_lastName' },
		submit: { css: '#register input[type=submit]'}
	},

	register: function(first, last) {
		this.firstName = first;
		this.lastName = last;
		return this.submit.click();
	}
}