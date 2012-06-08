module.exports = function(TR, driver) {
	var oldName = 'Totok',
		newName = 'Totoka';
	
	return new TR.Feature("A user should be able to change his name", [
		ToolbarWidget.editUser,
		{ 'ToolbarWidget.username': '1' },
		NameEditorWidget.setUsername.bind(NameEditorWidget, newName),
		{ 'ToolbarWidget.username': '2' },
		NameEditorWidget.setUsername.bind(NameEditorWidget, oldName),
		{ 'ToolbarWidget.username': '3' }
	]);
}