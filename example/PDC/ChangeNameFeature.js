module.exports = function(TR, driver) {
	var oldName = 'Totok',
		newName = 'Totoka';
	
	return new TR.Feature("A user should be able to change his name", [
		ToolbarWidget.editUser,
		{ 'ToolbarWidget.username': oldName },
		NameEditorWidget.setUsername, newName,
		{ 'ToolbarWidget.username': newName },
		NameEditorWidget.setUsername, oldName,
		{ 'ToolbarWidget.username': oldName }
	]);
}