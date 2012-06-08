module.exports = function(TR, driver) {
	var toolbar = require('./ToolbarWidget')(TR, driver),
		manager = require('./NameEditorWidget')(TR, driver);
		
	var newName = 'Totok';
	
	return new TR.Feature("A user should be able to change his name", function(assert) {
		toolbar.editUser();
		
		var works = true;

		var oldName = manager.username.value;
		manager.setUsername(newName);
		
		if (manager.username.value != newName)
			works = false;
			
		manager.setUsername(oldName);

		if (manager.username.value != oldName)
			works = false;
		
		assert(works);
	});
}
