var growl;
try {
	growl = require('growl');

	exports.success = function onSuccess() {
		growl('All tests succeeded!  :)', { priority: 3, title: 'Success'  });
	}

	exports.failure = function onFailure(failures) {
		growl('Some tests failed  :(', { priority: 4, title: 'Failure' });
	}

	exports.error = function onError(error) {
		growl(error, { priority: 4 , title: 'Engine error' });
	}
} catch (e) {
	console.warn('Unable to load the "growl" module, will not define any Growl support.');
}
