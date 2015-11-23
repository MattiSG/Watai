var Watai = require('./subject');


/** Component description of elements existing in the test support page resource.
*/
var elements = exports.elements = {
	id									: '#toto',
	css									: '.tutu',
	missing								: '#missing',
	hidden								: '#hidden',
	regexpTestField						: 'input[name="regexpTestField"]',
	inputField							: 'input[name="field"]',
	changeTextareaValueNowLink			: { linkText: 'This paragraph is embedded in a link' },
	changeTextareaValueLaterLink		: '#delayLink',
	changeTextareaValueLaterAgainLink	: '#delayLink2',
	pressButton							: '#button',
	toggleCheckbox						: '#box',
	selectRadio							: '#radio',
	overlayedActionLink					: '#under',
	hideOverlayLink						: '#removeOver',
	output								: '#output',
	outputField							: { name: 'outputField' },
	badSelector							: { thisIsInvalid: 'sure' }
};

/** Expected values for the texts of the elements described above, as defined in the test support page.
* Exported for use in other tests.
*
*@see	#elements
*/
exports.expectedContents = {
	id:		'This paragraph has id toto',
	outputField: 'This is a value'
};

/** Expected values for the results of the elements described above, as defined in the test support page.
* Exported for use in other tests.
*
*@see	#elements
*/
exports.expectedOutputs = {
	changeTextareaValueNowLink:	'#link has been clicked',
	changeTextareaValueLaterLink:		'#delayLink has been clicked',
	changeTextareaValueLaterAgainLink:	'#delayLink2 has been clicked',
	pressButton:			'#button has been pressed',
	toggleCheckbox:			'#box has been checked',
	selectRadio:			'#radio has been selected',
	overlayedActionLink:	'#under has been clicked'
};

/** A full component describing the “main” part of the test support page.
* Exported for use in other tests.
*
*@param	{WebDriver}	driver	The driver in which the Component should be described.
*@see	#elements
*/
exports.getComponent = function(driver) {
	return new Watai.Component('Test component', Object.merge({

		submit: function submit(value) {
			return	this.setInputField(value)()
						.then(driver.submit.bind(driver));
		},

		beClever: function doSomethingVeryClever() {	// used in report view test
			return true;
		}
	}, elements), driver);
};
