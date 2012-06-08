module.exports = function(TR, driver) {
	var toolbar = require('./ToolbarWidget')(TR, driver),
		manager = require('./NameEditorWidget')(TR, driver);
		
	var newName = 'Totoka';
	
	return new TR.Feature("A user should be able to change his name", function(assert) {
		toolbar.editUser();
		
		var works = true;

		var oldName;
		
		manager.getUsername().then(function(value) {
			oldName = value;
			
			manager.setUsername(newName).then(function() {
				manager.getUsername().then(function(newVal) { 
					assert(newVal == newName)
				}).then(function() {
					manager.setUsername(oldName).then(function() {
						manager.getUsername().then(function(nextVal) {
							assert(nextVal == oldName);
						});
					});
				});
			});
		});
	});
}
