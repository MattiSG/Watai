module.exports = function(TR, driver) {
	var oldName = 'Totok',
		newName = 'Totoka';
	
	return new TR.Feature("A user should be able to change his name", [
		ToolbarWidget.editUser.bind(ToolbarWidget),
		{ 'ToolbarWidget.username': oldName },
		NameEditorWidget.setUsername.bind(NameEditorWidget, newName),
		{ 'ToolbarWidget.username': newName },
		NameEditorWidget.setUsername.bind(NameEditorWidget, oldName),
		{ 'ToolbarWidget.username': oldName }
	]);
}