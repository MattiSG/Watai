var TestRight = require('./subject');


/** Widget description of elements existing in the test support page resource.
*/
var elements = exports.elements = {
	id:		{ id: 'toto' },
	css:	{ css: '.tutu' },
	missing:{ id: 'inexistant' },
	field:	{ css: 'input[name="field"]' },
	p3Link:	{ linkText: 'This paragraph is embedded in a link' },
	delayedActionLink:	{ id: 'delayLink' },
	delayedAction2Link:	{ id: 'delayLink2' },
	output:	{ id: 'output' }
}

/** Expected values for the texts of the elements described above, as defined in the test support page.
* Exported for use in other tests.
*
*@see	#elements
*/
exports.expectedTexts = {
	id:		'This paragraph has id toto'
}

/** Expected values for the results of the elements described above, as defined in the test support page.
* Exported for use in other tests.
*
*@see	#elements
*/
exports.expectedOutputs = {
	linkClick: '#link has been clicked',
	delayedActionLink: '#delayLink has been clicked',
	delayedAction2Link: '#delayLink2 has been clicked'
}

/** A full widget describing the “main” part of the test support page.
* Exported for use in other tests.
*
*@param	{WebDriver}	driver	The driver in which the Widget should be described.
*@see	#elements
*/
exports.getWidget = function(driver) {
	return new TestRight.Widget('Test widget', {
		elements: elements,
		submit: function submit(value) {
			this.field = value;
			return this.field.submit();
		}
	}, driver);
}
