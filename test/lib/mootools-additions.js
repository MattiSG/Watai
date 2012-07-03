var should = require('should');


describe('MooTools additions', function() {
	var newSubject = function newSubject() {
		var result = {
			touched: false,
			outer: {
				medium: { }
			}
		}
		
		result.outer.medium.__defineGetter__('inner', function() {
			result.touched = true;
			return true;
		});
		
		return result;
	}
	
	var path = 'outer.medium.inner';
	
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
