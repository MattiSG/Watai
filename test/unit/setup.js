module.exports = {
	log: {
		init: {
			console: {
				level		: 'error',
				colorize	: true
			}
		},
		load: {
			console: {
				silent: true	// we will test for errors and don't want these errors to be logged
			}
		}
	}
}
