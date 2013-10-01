module.exports = {
	build: function(promise, promiseTrigger) {
		setTimeout(function() {
			promise.reject(new Error('boom'));
		}, 0);

		return promise.promise;
	}
}
