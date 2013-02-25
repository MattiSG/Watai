/**@class	Logs feature failures and errors as they come.
*/
var RunnerInstafail = new Class({
	Extends: require('../PromiseView'),

	/** Attaches the Feature/Instafail view to all features started by the Runner listened to.
	*/
	submodel: {
		name: 'feature',
		view: require('../Feature/Instafail')
	}
});


module.exports = RunnerInstafail;	// CommonJS export
