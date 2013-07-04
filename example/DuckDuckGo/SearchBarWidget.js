{
	elements: {
		field:	{ name: 'q' }
	},

	searchFor: function searchFor(term) {
		return this.setField(term)().then(function(element) {
			return driver.submit(element);
		});
	}
}
