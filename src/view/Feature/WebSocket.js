'use strict';

var FeatureWebSocketView = new Class({

	Extends: require('../PromiseView'),

	showSuccess: function showSuccess() {
		var self = this;
		this.sender.emit('send', {
			type        : self.wsNamespace + 'feature',
			runDate     : self.runDate,
			status      : 'success',
			description : self.model.description
		});
	},

	showFailure: function showFailure(reason) {
		var self = this;
		this.sender.emit('send', {
			type        : self.wsNamespace + 'feature',
			runDate     : self.runDate,
			status      : 'failure',
			description : self.model.description + ' (#' + self.model.id + ')',
			reason      : this.getErrorDescription(reason)
		});
	}

});

module.exports = FeatureWebSocketView;
