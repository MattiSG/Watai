description: 'A user should be able to log out',

scenario: [
	ToolbarComponent.logout(),
	{ 'LoginComponent.openLink': true }
]
