module.exports = {
	build: function(promise) {
		setTimeout(function() {
			promise.reject(new Error('boom'));
		}, 0);

		return promise.promise;
	}
}
