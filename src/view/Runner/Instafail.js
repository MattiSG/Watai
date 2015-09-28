/**@class	Logs scenario failures and errors as they come.
*/
var RunnerInstafail = new Class({
	Extends: require('../PromiseView'),

	/** Attaches the Scenario/Instafail view to all scenarios started by the Runner listened to.
	*/
	submodel: {
		name: 'scenario',
		view: require('../Scenario/Instafail')
	}
});


module.exports = RunnerInstafail;	// CommonJS export
