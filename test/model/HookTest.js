var Hook = require('../../src/model/Hook');


require('../helpers').test('model/Hook', function() {
	var hooksTarget = {};
	
	describe('selectors', function() {
		it('should support ID selection', function() {
			var hookName = 'id';
			
			Hook.addHook(hooksTarget, hookName, { id: 'toto' }, driver);
			
			hooksTarget.should.have.property(hookName);
			hooksTarget[hookName].should.be.a('object');
		});
	});
});
