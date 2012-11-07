{
	description: 'A user should be able to log in',

	scenario: [
		LoginWidget.open,
		LoginWidget.login, email, password,

		{ 'ToolbarWidget.username': oldName }
	]
}
