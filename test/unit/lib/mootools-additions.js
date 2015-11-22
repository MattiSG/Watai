var should = require('should');
require('mootools');
require('../../../src/lib/mootools-additions');


describe('MooTools additions', function() {
	var newSubject = function newSubject() {
		var result = {
			touched: false,
			outer: {
				medium: { }
			}
		};

		result.outer.medium.__defineGetter__('inner', function() {
			result.touched = true;
			return true;
		});

		return result;
	};

	var path = 'outer.medium.inner';

	describe('Object', function() {
		describe('hasPropertyPath', function() {
			it('should find a path without actually accessing the last property', function() {
				var subject = newSubject();
				Object.hasPropertyPath(subject, path).should.be.ok;
				subject.touched.should.not.be.ok;
			});

			it('should not find a path that does not exist', function() {
				var subject = newSubject();
				Object.hasPropertyPath(subject, 'toto').should.not.be.ok;
				Object.hasPropertyPath(subject, '.toto').should.not.be.ok;
				Object.hasPropertyPath(subject, path + '.toto').should.not.be.ok;
			});
		});

		describe('getFromPath', function() {
			it('should access a path', function() {
				var subject = newSubject();
				Object.getFromPath(subject, path).should.be.ok;
				subject.touched.should.be.ok;
			});

			it('should not find a path that does not exist', function() {
				var subject = newSubject();
				should.not.exist(Object.getFromPath(subject, path + 'toto'));
				should.not.exist(Object.getFromPath(subject, path + '.toto'));
			});
		});
	});

	describe('String', function() {
		describe('count', function() {
			var subject;

			describe('default pluralization', function() {
				beforeEach(function() {
					subject = 'scenario';
				});

				it('should keep the same form if 1', function() {
					subject.count(1).should.equal('1 ' + subject);
				});

				it('should be pluralized if > 1', function() {
					subject.count(2).should.equal('2 ' + subject + 's');
				});

				it('should be pluralized if 0', function() {
					subject.count(0).should.equal('0 ' + subject + 's');
				});
			});

			describe('specific pluralization', function() {
				beforeEach(function() {
					subject = 'success';
				});

				it('should keep the same form if 1', function() {
					subject.count(1, 'es').should.equal('1 ' + subject);
				});

				it('should be pluralized if > 1', function() {
					subject.count(2, 'es').should.equal('2 ' + subject + 'es');
				});

				it('should be pluralized if 0', function() {
					subject.count(0, 'es').should.equal('0 ' + subject + 'es');
				});
			});
		});


		describe('humanize', function() {
			var EXPECTED = 'i like cookies';

			it('should treat small camel-cased strings', function() {
				'iLikeCookies'.humanize().should.equal(EXPECTED);
			});

			it('should treat capitalized camel-cased strings', function() {
				'ILikeCookies'.humanize().should.equal(EXPECTED);
			});

			it('should treat hyphenated strings', function() {
				'i-like-cookies'.humanize().should.equal(EXPECTED);
			});

			it('should treat snake-cased strings', function() {
				'i_like_cookies'.humanize().should.equal(EXPECTED);
			});
		});
	});
});
