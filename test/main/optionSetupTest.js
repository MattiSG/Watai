var spawn = require('child_process').spawn;


var BIN = './src/index.js';


describe('--setup option', function() {
	it('should fail if not passed any option', function(done) {
		var subject = spawn(BIN, [ '--setup', 'example/DuckDuckGo' ]);

		subject.on('exit', function(code) {
			code.should.equal(1);
			done();
		});
	});

	describe('passed badly-formatted options', function(done) {
		var subject,
			detailsGiven = false;

		before(function() {
			subject = spawn(BIN, [ '--setup', '{', 'example/DuckDuckGo' ]);

			subject.stderr.on('data', function(data) {
				if (data.toString().match(/--setup/))
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

		var subject = spawn(BIN, [ '--setup', '{}', 'test/resources/SucceedingSuite' ]);

		subject.on('exit', function(code) {
			code.should.equal(0);
			done();
		});
	});
});
