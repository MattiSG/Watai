elements: {
	firstName	: '#register #register_firstName',
	lastName	: '#register #register_lastName',
	submitButton: '#register input[type=submit]'
},

register: function(first, last) {
	return	this.setFirstName(first)()
				.then(this.setLastName(last))
				.then(this.submit());
}
