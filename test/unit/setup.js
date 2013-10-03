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
	},
	asyncTracesLimit: -1	// set to -1 for unlimited, 0 for none. More details at <https://github.com/mattinsler/longjohn#README>.
}
