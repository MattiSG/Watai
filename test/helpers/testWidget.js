var Watai = require('./subject');


/** Widget description of elements existing in the test support page resource.
*/
var elements = exports.elements = {
	id:						{ id: 'toto' },
	css:					{ css: '.tutu' },
	missing:				{ id: 'missing' },
	hidden:					{ id: 'hidden' },
	regexpTestField:		{ css: 'input[name="regexpTestField"]' },
	inputField:				{ css: 'input[name="field"]' },
	immediateActionLink:	{ linkText: 'This paragraph is embedded in a link' },
	delayedActionLink:		{ id: 'delayLink' },
	otherDelayedActionLink:	{ id: 'delayLink2' },
	pressButton:			{ id: 'button' },
	toggleCheckbox:			{ id: 'box' },
	selectRadio:			{ id: 'radio' },
	overlayedActionLink:	{ id: 'under' },
	hideOverlayLink:		{ id: 'removeOver' },
	output:					{ id: 'output' },
	outputField:			{ name: 'outputField' },
	badSelector:			{ thisIsInvalid: 'sure' }
}

/** Expected values for the texts of the elements described above, as defined in the test support page.
* Exported for use in other tests.
*
*@see	#elements
*/
exports.expectedContents = {
	id:		'This paragraph has id toto',
	outputField: 'This is a value'
}

/** Expected values for the results of the elements described above, as defined in the test support page.
* Exported for use in other tests.
*
*@see	#elements
*/
exports.expectedOutputs = {
	immediateActionLink:	'#link has been clicked',
	delayedActionLink:		'#delayLink has been clicked',
	otherDelayedActionLink:	'#delayLink2 has been clicked',
	pressButton:			'#button has been pressed',
	toggleCheckbox:			'#box has been checked',
	selectRadio:			'#radio has been selected',
	overlayedActionLink:	'#under has been clicked'
}

/** A full widget describing the “main” part of the test support page.
* Exported for use in other tests.
*
*@param	{WebDriver}	driver	The driver in which the Widget should be described.
*@see	#elements
*/
exports.getWidget = function(driver) {
	return new Watai.Widget('Test widget', {

		elements: elements,

		submit: function submit(value) {
			return	this.setInputField(value)()
						.then(driver.submit.bind(driver));
		}
	}, driver);
}
