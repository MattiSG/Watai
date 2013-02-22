var ViewsManager = {
	/** Attaches a view, identified by its name, to the given event emitter.
	* A view is simply an object whose keys match events emitted by their intended source.
	*
	*@param	{String}		viewName	The identifier of the view, as a path from this manager to the declaration file.
	*@param	{EventEmitter}	emitter		A source of events that will be listened to by the given view.
	*@returns	emitter	for easy assignment
	*@throws	ReferenceError	If the given view or event emitter does not exist.
	*/
	attach: function attach(viewName, emitter) {
		var viewObject;

		try {
			viewObject = require('../../src/view/' + viewName);
		} catch (err) {
			throw new ReferenceError([
				err.message,
				'',
				'The view "' + viewName + '" does not seem to exist.',
				'Are you sure you did not misspell it?',
				'If not, then it might be that the config file you are using does not match the executed Watai version.'
			].join('\n'));
		}

		if (! (emitter && emitter.on)) {
			throw new ReferenceError('The given object is not a valid event emitter.');
		}

		Object.each(viewObject, function(handler, eventType) {
			emitter.on(eventType, handler.bind(viewObject));
		});

		return emitter;
	}
};


module.exports = ViewsManager;	// CommonJS export
