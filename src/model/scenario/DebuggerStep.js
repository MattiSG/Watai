var promises = require('q');
var readline = require('readline');

/**@class	A step that parses and evaluates a widget debugger assertion.
*
*@extends	steps.AbstractStep
*@memberOf	steps
*/
var DebuggerStep = new Class(/** @lends steps.DebuggerStep# */{
	Extends: require('./AbstractStep'),

	type: 'debugger',

	test: function test(timeout) {
		this.deferred = promises.defer();
		var promiseForUserAction = this.generatePromiseForUserAction();
		this.deferred.resolve({
			promiseForUserAction: promiseForUserAction,
			triggerDebugMode: true
		});

		return this.deferred.promise;
	},

	generatePromiseForUserAction: function generatePromiseForUserAction() {
		var deferred = promises.defer();
		var rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});

		rl.question("Enter 'c' to continue:", function(answer) {
			deferred.resolve(answer);
			rl.close();
		});

		return deferred.promise;
	},

	toString: function toString() {
		return 'Debugger assertion';
	}
});


module.exports = DebuggerStep;	// CommonJS export
