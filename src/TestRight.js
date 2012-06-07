require('mootools');


module.exports = function(driver) {
	return {
		Widget: require('./model/Widget')(driver)
	}
}
