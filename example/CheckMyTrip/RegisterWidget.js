firstName	: { css: '#register #register_firstName' },
lastName	: { css: '#register #register_lastName' },
submitButton: { css: '#register input[type=submit]'},

register: function(first, last) {
	return	this.setFirstName(first)()
				.then(this.setLastName(last))
				.then(this.submit());
}
