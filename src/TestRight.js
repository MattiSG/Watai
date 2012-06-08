require('mootools');


module.exports = function() {
	return {
		Widget:		require('./model/Widget'),
		Feature:	require('./model/Feature'),
		Runner:		require('./controller/Runner'),
		SuiteLoader:require('./controller/SuiteLoader')
	}
}
