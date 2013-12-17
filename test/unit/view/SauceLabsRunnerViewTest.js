var urlUtils = require('url');

var Watai			= require('../helpers/subject'),
	ConfigLoader	= require('mattisg.configloader'),
	stdoutSpy		= require('../helpers/StdoutSpy'),
	SauceLabsView	= require(Watai.path + '/view/Runner/SauceLabs');


/** This test suite is written with [Mocha](http://visionmedia.github.com/mocha/) and [Should](https://github.com/visionmedia/should.js).
*/
describe('SauceLabs view', function() {
	var subject,
		runner;

	before(function() {
		var config = new ConfigLoader({
			from		: __dirname,
			appName		: 'watai',
			override	: { quit: 'always' },
			visitAlso	: '../../src'
		}).load('config');

		this.timeout(config.browserWarmupTime);

		runner = new Watai.Runner(config);

		subject = new SauceLabsView(runner);
	});


	describe('#getAuth', function() {

		describe('when there is no way to get the data', function() {
			beforeEach(stdoutSpy.mute);
			afterEach(stdoutSpy.unmute);

			it('should throw', function() {
				(subject.getAuth.bind(subject)).should.throw(ReferenceError);
			});

			it('should provide information to the user', function() {
				stdoutSpy.printed().should.include('SauceLabs authentication');
				stdoutSpy.printed().should.include('config');
				stdoutSpy.printed().should.include('SAUCE_USERNAME');
				stdoutSpy.printed().should.include('SAUCE_ACCESS_KEY');
			});
		});


		function checkMatch(username, accessKey) {
			var data = subject.getAuth();
			data.username.should.equal(username);
			data.password.should.equal(accessKey);
		}

		describe('when auth is set through environment variables', function() {
			before(function() {
				process.env.SAUCE_USERNAME = 'user-env';
				process.env.SAUCE_ACCESS_KEY = 'pass-env';
			});

			it('should obtain auth data from environment variables', function() {
				checkMatch('user-env', 'pass-env')
			});
		});

		describe('when auth is set through config', function() {
			before(function() {
				var seleniumServerURL = urlUtils.parse(runner.config.seleniumServerURL);
				seleniumServerURL.auth = 'user-config:pass-config';
				runner.config.seleniumServerURL = urlUtils.format(seleniumServerURL);
			});

			it('should obtain auth data from environment variables', function() {
				checkMatch('user-config', 'pass-config');
			});
		});

	});

});
