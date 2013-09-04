var spawn = require('child_process').spawn;


var BIN = './src/index.js';


describe('--config option', function() {
	it('should override the config values', function(done) {
		this.timeout(30 * 1000);

		var config = {
			baseURL: 'file://' + __dirname + '/../resources/page_with_missing_element.html'	// the strategy is to use a suite that fails with its default config, and works with the overriding options
		};

		var subject = spawn(BIN, [ '--config', JSON.stringify(config), 'test/resources/FailingSuite' ]);

		subject.on('exit', function(code) {
			code.should.equal(0);
			done();
		});
	});

	describe('overrides partial config values, such as', function() {	// TODO: this would be better in SuiteLoader unit tests; to be done in a large SuiteLoader refactor
		it('baseURL#port', function(done) {
			this.timeout(30 * 1000);

			var config = {
				baseURL: {	// the strategy is to use a suite that fails with its default config, and works with the overriding options
					pathname: __dirname + '/../resources/page_with_missing_element.html'	// overriding the pathname only means at least the protocol has to be obtained from the actual config file
				}
			};

			var subject = spawn(BIN, [ '--config', JSON.stringify(config), 'test/resources/FailingSuite' ]);

			subject.on('exit', function(code) {
				code.should.equal(0);
				done();
			});
		});
	});

	it('should fail if not passed any option', function(done) {
		var subject = spawn(BIN, [ '--config', 'example/DuckDuckGo' ]);

		subject.on('exit', function(code) {
			code.should.not.equal(0); // Node 0.8 returns an error code 1 and Node 0.10 returns an error code 8, for retrocompatibility we test only if the code is not a success code 0
			done();
		});
	});

	describe('passed badly-formatted options', function(done) {
		var subject,
			detailsGiven = false;

		before(function() {
			subject = spawn(BIN, [ '--config', '{', 'test/resources/FailingSuite' ]);

			subject.stderr.on('data', function(data) {
				if (data.toString().match(/--config/))
					detailsGiven = true;
			});
		});


		it('should fail', function(done) {
			subject.on('exit', function(code) {
				code.should.not.equal(0); // Node 0.8 returns an error code 1 and Node 0.10 returns an error code 8, for retrocompatibility we test only if the code is not a success code 0
				done();
			});
		});

		it('should give details', function() {
			detailsGiven.should.be.true;
		});
	});

	it('should not do anything if passed empty options', function(done) {
		this.timeout(30 * 1000);

		var subject = spawn(BIN, [ '--config', '{}', 'test/resources/FailingSuite' ]);

		subject.on('exit', function(code) {
			code.should.equal(1);
			done();
		});
	});
});
