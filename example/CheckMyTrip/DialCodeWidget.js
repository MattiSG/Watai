elements: {
	selector		: '#dialingCode input[type=text]' ,
	submitButton	: '#dialingCode input[type=submit]' ,
	result			: '#dialingCode .result-wrapper .main'
},

lookup: function lookup(country) {
	return	this.setSelector(country)()	// immediate execution to start the chain
				.then(this.submit());
}
