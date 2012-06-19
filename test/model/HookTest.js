var Hook = require('../../src/model/Hook');


require('../helpers').test('model/Hook', function() {
	var hooksTarget = {};
	
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
	
	describe('selector', function() {
		describe('with ID', function() {
			var hookName = 'id';
			
			Hook.addHook(hooksTarget, hookName, { id: 'toto' }, driver);
			
			checkHook(hookName, 'This paragraph has id toto');
		});

		describe('with CSS', function() {
			var hookName = 'css';
			
			Hook.addHook(hooksTarget, hookName, { css: '.tutu' }, driver);
			
			checkHook(hookName, 'This paragraph has class tutu');
		});

		describe('with Xpath', function() {
			var hookName = 'xpath';
			
			Hook.addHook(hooksTarget, hookName, { xpath: '//div[@id="selectors"]/p[3]' }, driver);
			
			checkHook(hookName, 'This paragraph is the third of the selectors div');
		});
		
		describe('with link text', function() {
			var hookName = 'linkText';
			
			Hook.addHook(hooksTarget, hookName, { linkText: 'This paragraph is embedded in a link' }, driver);
			
			checkHook(hookName, 'This paragraph is embedded in a link');
		});
		
		it('should work on a field too', function(done) {
			var target = 'field';
				
			Hook.addHook(hooksTarget, target, { css: 'input[name="field"]' }, driver);
			
			hooksTarget[target].getAttribute('value').then(function(content) {
				content.should.equal('Default');
				done();
			});
		});
	});
	
	describe('setter', function() {
		it('should set the value upon attribution', function(done) {
			var target = 'field',
				newContent = 'new content';
				
			Hook.addHook(hooksTarget, target, { css: 'input[name="field"]' }, driver);
			
			hooksTarget[target] = newContent;

			hooksTarget[target].getAttribute('value').then(function(content) {
				content.should.equal(newContent);
				done();
			});
		});
	});
});
