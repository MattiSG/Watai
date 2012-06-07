require('../../mootools-node');


module.exports = function(driver) {
	return {
		Widget: require('./model/Widget')(driver)
	}
}
