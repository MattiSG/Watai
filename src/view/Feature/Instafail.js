/** Logs feature failures and errors as they come.
*
*@class
*/
var Instafail = new Class(/** @lends Instafail# */{
	Extends: require('../PromiseView'),

	submodel: {
		name: 'step',
		view: require('../Step/CLI')
	}
});

module.exports = Instafail;	// CommonJS export
