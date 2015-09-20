description: 'A user should be able to change his name',

scenario: [
	ToolbarComponent.editUser(),
	{ 'ToolbarComponent.username': oldName },
	NameEditorComponent.setUsername(newName),
	{ 'ToolbarComponent.username': newName },
	NameEditorComponent.setUsername(oldName),
	{ 'ToolbarComponent.username': oldName }
]
