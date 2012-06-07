/** A Feature models sequences of actions to be executed through Widgets.
*/
module.exports = new Class({
	/**
	*@param	description	A plaintext description of the feature, advised to be written in a BDD fashion.
	*@param	test	A closure that will exercise widgets and do assertions on them.
	*/
	initialize: function init(description, test) {
		this.description = description;
		
		this.test = test;
	}
});