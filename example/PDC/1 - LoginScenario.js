description: 'A user should be able to log in',

steps: [
	LoginComponent.open(),
	LoginComponent.login(email, password),

	{ 'ToolbarComponent.username': oldName }
]
