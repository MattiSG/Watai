{
	description: 'A user should be able to change his name',
	
	scenario: [
		ToolbarWidget.editUser(),
		{ 'ToolbarWidget.username': oldName },
		NameEditorWidget.setUsername(newName),
		{ 'ToolbarWidget.username': newName },
		NameEditorWidget.setUsername(oldName),
		{ 'ToolbarWidget.username': oldName }
	]
}