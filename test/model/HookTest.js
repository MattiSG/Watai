var Hook = require('../../src/model/Hook');


require('../helpers').test('model/Hook', function() {
	var hooksTarget = {};
	
	describe('selectors', function() {
		var checkHook = function checkHook(hookName, expectedContent) {
			it('should add a hook to the target object', function() {
				hooksTarget.should.have.property(hookName);
			});
			
			it('should return an object when accessed', function() {
				hooksTarget[hookName].should.be.a('object');
			});
			
			it('should have the correct text in the retrieved element', function(done) {
				hooksTarget[hookName].getText().then(function(content) {
					content.should.equal(expectedContent);
					done();
				});
			});
		}
		
		describe('ID selection', function() {
			var hookName = 'id';
			
			Hook.addHook(hooksTarget, hookName, { id: 'toto' }, driver);
			
			checkHook(hookName, 'This paragraph has id toto');
		});
	});
});
