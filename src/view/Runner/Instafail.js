/**@namespace	Logs feature failures and errors as they come.
*/
var Instafail = {};


/** Attaches the Feature/Instafail view to all features started by the Runner listened to.
*/
Instafail.featureStart = function onFeatureStart(feature) {
	require('../ViewsManager').attach('Feature/Instafail', feature);
}


module.exports = Instafail;	// CommonJS export
