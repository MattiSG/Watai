{
	elements: {
		field:	{ name: 'q' }
	},

	submit: function submit() {
		return this.field.then(function(element) {
			return driver.submit(element);
		});
	}
}
