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

	it('should fail if not passed any option', function(done) {
		var subject = spawn(BIN, [ '--config', 'test/resources/FailingSuite' ]);

		subject.on('exit', function(code) {
			code.should.equal(1);
			done();
		});
	});

	describe('with details if passed incorrectly-formatted options', function(done) {
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
				code.should.equal(1);
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
