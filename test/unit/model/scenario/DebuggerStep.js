var promises = require('q');


var Watai = require('../../helpers/subject'),
	DebuggerStep = Watai.steps.DebuggerStep;

describe('DebuggerStep', function() {

	it('should offer a `test` method', function() {
		var result = new DebuggerStep();
		result.test.should.be.a('function');
		promises.isPromise(result.test()).should.be.ok;
	});
});
