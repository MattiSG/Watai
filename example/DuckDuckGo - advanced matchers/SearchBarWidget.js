{
	elements: {
		field:	{ name: 'q' }
	},

	searchFor: function searchFor(term) {
		return	this.setField(term)()
					.then(driver.submit.bind(driver));
	}
}
