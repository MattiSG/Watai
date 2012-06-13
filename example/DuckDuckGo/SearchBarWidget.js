module.exports = function(TR, driver) {
	return new TR.Widget('searchbar', {
		elements: {
			field:		{ name: 'q' }
		},
		
		searchFor: function searchFor(term) {
			this.field = term;
			return this.field.submit();
		}
	}, driver);
}
