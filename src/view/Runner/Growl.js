var growl;
try {
	growl = require('growl');

	exports.failure = function onFailure(failures) {
		growl('Test failed  :(', { priority: 4 });
	}

	exports.success = function onSuccess() {
		growl('Test succeeded!  :)', { priority: 3 });
	}
} catch (e) {
	console.warn('Unable to load the "growl" module, will not define any Growl support.');
}
