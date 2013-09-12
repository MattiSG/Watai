firstName	: '#register #register_firstName',
lastName	: '#register #register_lastName',
submitButton: '#register input[type=submit]',

register: function(first, last) {
	return	this.setFirstName(first)()	// (yes, this syntax is ugly and will be fixed in an upcoming release, see issue #99)
				.then(this.setLastName(last))
				.then(this.submit());
}
