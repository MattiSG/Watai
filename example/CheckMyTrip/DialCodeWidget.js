selector		: '#dialingCode input[type=text]' ,
submitButton	: '#dialingCode input[type=submit]' ,
result			: '#dialingCode .result-wrapper .main',

lookup: function(country) {
	return	this.setSelector(country)()	// immediate execution to start the chain (yes, this syntax is ugly and will be fixed in an upcoming release, see issue #99)
				.then(this.submit());
}
