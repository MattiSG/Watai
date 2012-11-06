var should = require('should'),
	manager = require('../helpers/subject').config;


describe('Configuration manager', function() {
	it('should allow setting values', function() {
		manager.set({
			test: 'toto',
			nested: {
				inside: 'yes'
			}
		});
	})

	it('should get previously set values', function() {
		manager.values.test.should.equal('toto');
		manager.values.nested.should.be.a('object');
		manager.values.nested.inside.should.equal('yes');
	});
});
