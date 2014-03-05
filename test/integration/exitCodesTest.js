var spawn = require('child_process').spawn;


var BIN = './src/index.js';


describe('Exit code', function() {
	it('should be 2 when passed no arguments', function(done) {
		var subject = spawn(BIN);

		subject.on('exit', function(code) {
			code.should.equal(2);
			done();
		});
	});

	it('should be 2 when passed too many arguments', function(done) {
		var subject = spawn(BIN, [ 'test/resources/FailingSuite', 'test/resources/FailingSuite' ]);

		subject.on('exit', function(code) {
			code.should.equal(2);
			done();
		});
	});

	[ 'help', 'installed', 'version' ].forEach(function(option) {
		it('should be 0 when called with --' + option, function(done) {
			var subject = spawn(BIN, [ '--' + option ]);

			subject.on('exit', function(code) {
				code.should.equal(0);
				done();
			});
		});
	});

	describe('on an empty suite', function() {
		var subject,
			message,
			code;

		before(function(done) {
			this.timeout(30 * 1000);

			var subject = spawn(BIN, [ 'test/resources/EmptySuite' ]);

			subject.stderr.on('data', function(data) {
				message = data.toString();
			});

			subject.on('exit', function(statusCode) {
				code = statusCode;
				done();
			});
		});

		it('should be 16', function() {
			code.should.equal(16);
		});

		it('should provide an explicit message', function() {
			message.should.match(/no feature found/i);
		});
	});

	it('should be 1 on a failed test', function(done) {
		this.timeout(30 * 1000);

		var subject = spawn(BIN, [ 'test/resources/FailingSuite' ]);

		subject.on('exit', function(code) {
			code.should.equal(1);
			done();
		});
	});

	it('should be 0 on a successful test', function(done) {
		this.timeout(30 * 1000);

		var subject = spawn(BIN, [ 'test/resources/SucceedingSuite' ]);

		subject.on('exit', function(code) {
			code.should.equal(0);
			done();
		});
	});
});
