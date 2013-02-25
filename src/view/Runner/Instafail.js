var FeatureInstafailView = require('../Feature/Instafail');


/**@class	Logs feature failures and errors as they come.
*/
var RunnerInstafail = new Class({
	events: {
		/** Attaches the Feature/Instafail view to all features started by the Runner listened to.
		*/
		feature: function onFeatureStart(feature) {
			new FeatureInstafailView(feature);
		}
	}
});


module.exports = RunnerInstafail;	// CommonJS export
