module.exports = {
	"log": {
		"init": {
			"console": {
				"level"		: "error",
				"colorize"	: true
			}
		},
		"load": {
			"console": {
				"level"		: "warn",
				"colorize"	: true
			}
		}
	},
	"asyncTracesLimit": 40	// set to -1 for unlimited, 0 for none. More details at <https://github.com/mattinsler/longjohn#README>.
}
