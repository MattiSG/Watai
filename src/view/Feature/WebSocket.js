'use strict';

var FeatureWebSocketView = new Class({

	Extends: require('../PromiseView'),

	showSuccess: function showSuccess() {
		var self = this;
		this.sender.emit('send', {
			type        : self.wsNamespace + 'feature',
			runDate     : self.runDate,
			status      : 'success',
			description : self.model.description,
			reasons     : []
		});
	},

	showFailure: function showFailure(reasons) {
		var self = this;
		this.sender.emit('send', {
			type        : self.wsNamespace + 'feature',
			runDate     : self.runDate,
			status      : 'failure',
			description : self.model.description + ' (#' + self.model.id + ')',
			reasons     : reasons
		});
	}

});

module.exports = FeatureWebSocketView;
