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

	it('should fail on a successful test without its only feature', function(done) {
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

});
