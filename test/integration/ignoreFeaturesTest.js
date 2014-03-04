var spawn = require('child_process').spawn;


var BIN = './src/index.js';


describe('--config without 1', function() {

	it('should be 1 on a failed test without the failing feature', function(done) {
		this.timeout(30 * 1000);

		var config = {
			without: [1]
		};

		var subject = spawn(BIN, [ '--config', JSON.stringify(config), 'test/resources/FailingSuite' ]);

		subject.on('exit', function(code) {
			code.should.equal(0);
			done();
		});
	});

	// suspended while exceptions thrown by loadAllFiles are ignored
	xit('should fail on a successful test without its only feature', function(done) {
		this.timeout(30 * 1000);

		var config = {
			without: [1]
		};

		var subject = spawn(BIN, [ '--config', JSON.stringify(config), 'test/resources/SucceedingSuite' ]);

		subject.on('exit', function(code) {
			code.should.not.equal(0);
			done();
		});
	});

	// suspended while exceptions thrown by loadAllFiles are ignored
	xdescribe('without a feature that does not exist', function() {
		var subject,
			message;

		before(function() {
			var config = {
				without: [5555]
			};

			subject = spawn(BIN, [ '--config', JSON.stringify(config), 'test/resources/SucceedingSuite' ]);

			subject.stderr.on('data', function(data) {
				message = data.toString();
			});
		});

		it('should fail', function(done) {
			this.timeout(10000);

			subject.on('exit', function(code) {
				code.should.not.equal(0);
				done();
			});
		});

		it('should give details', function() {
			message.should.match(/could not be found/);
		});
	});

});
