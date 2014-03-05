var spawn = require('child_process').spawn;


var BIN = './src/index.js';


describe('ignoring features', function() {

	it('exit code should be 0 on a failing test ignoring its failing feature', function(done) {
		this.timeout(30 * 1000);

		var config = {
			ignore: [1]
		};

		var subject = spawn(BIN, [ '--config', JSON.stringify(config), 'test/resources/FailingSuite' ]);

		subject.on('exit', function(code) {
			code.should.equal(0);
			done();
		});
	});

	it('should exit with 16 if all features are ignored', function(done) {
		this.timeout(30 * 1000);

		var config = {
			ignore: [1]
		};

		var subject = spawn(BIN, [ '--config', JSON.stringify(config), 'test/resources/SucceedingSuite' ]);

		subject.on('exit', function(code) {
			code.should.equal(16);
			done();
		});
	});

	describe('ignoring a feature that does not exist', function() {
		var code,
			message;

		before(function(done) {
			this.timeout(30 * 1000);

			var config = {
				ignore: [5555]
			};

			var subject = spawn(BIN, [ '--config', JSON.stringify(config), 'test/resources/SucceedingSuite' ]);

			subject.stderr.on('data', function(data) {
				message = data.toString();
			});

			subject.on('exit', function(statusCode) {
				code = statusCode;
				done();
			});
		});

		it('should exit with 2', function() {
			code.should.equal(2);
		});

		it('should give details', function() {
			message.should.match(/could not be found/);
		});
	});

});
