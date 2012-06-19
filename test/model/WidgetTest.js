var HookTest = require('./HookTest');


/** This test suite is redacted with [Mocha](http://visionmedia.github.com/mocha/) and [Should](https://github.com/visionmedia/should.js).
* It relies on some external setup, see `test/helpers` and `test/index.js`.
*/
describe('Widget', function() {
	var elements = {
		id:		{ id: 'toto' },
		css:	{ css: '.tutu' },
		missing:{ id: 'inexistant' },
		field:	{ css: 'input[name="field"]' },
		p3Link:	{ linkText: 'This paragraph is embedded in a link' }
	}
	
	var subject = new TestRight.Widget('Test widget', {
		elements: elements,
		submit: function submit(value) {
			this.field = value;
			return this.field.submit();
		}
	}, driver);
	
			
	describe('parsing', function() {
		it('should add all elements as properties', function() {
			for (var key in elements)
				if (elements.hasOwnProperty(key)
					&& key != 'missing') {	// Should.js' property checker accesses the property, which would therefore make the missing element throw because it is unreachable
					subject.should.have.property(key);
					subject[key].should.be.a('object');
				}
		});
		
		it('should bind methods properly', function(done) {
			subject.submit('something');
			
			subject.field.getAttribute('value').then(function(value) {
				value.should.equal('Default');	// because the page has been reloaded
				done();
			});
		});
		
		it('should do some magic on *Link names', function() {
			subject.should.have.property('p3');
			subject.p3.should.be.a('function');	// on 'link', this should be a shortcut to clicking the element, not a simple access
		});
	});
	
	describe('element access', function() {
		it('should map elements to hooks', function(done) {
			subject.id.getText().then(function(text) {
				text.should.equal('This paragraph has id toto');
				done();
			});
		});
		
		it('should say that an existing element is present', function(done) {
			subject.has('id').then(function(presence) {
				presence.should.be.ok;
				done();
			});
		});
		
		it('should say that a missing element is not present', function(done) {
			subject.has('missing').then(function(presence) {
				presence.should.not.be.ok;
				done();
			});
		});
	
		xit('should throw an error if an unreachable element is accessed', function() {
			(function() {
				subject.missing.click();	//TODO: can't test this directly, as the exception is raised on a callback from the Selenium server… No clue for the moment.
			}).should.throw();
		});
	});
});
