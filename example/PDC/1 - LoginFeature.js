description: 'A user should be able to log in',

scenario: [
	LoginComponent.open(),
	LoginComponent.login(email, password),

	{ 'ToolbarComponent.username': oldName }
]
