var spawn = require('child_process').spawn;


var BIN = './src/index.js';


describe('with no reachable server', function() {
	var subject,
		detailsGiven = false;

	before(function() {
		subject = spawn(BIN, [ '--config', '{"seleniumServerURL":"http://0.0.0.0:3333","views":["CLI"]}', 'test/resources/SucceedingSuite' ]);	// activate a view in order to test message clarity

		subject.stderr.on('data', function(data) {
			if (data.toString().match(/server/))
				detailsGiven = true;
		});
	});

	it('should fail', function(done) {
		this.timeout(10000);

		subject.on('exit', function(code) {
			code.should.equal(4);
			done();
		});
	});

	it('should give details', function() {
		detailsGiven.should.be.true;
	});
});
