description: 'A user should be able to log out',

steps: [
	ToolbarComponent.logout(),
	{ 'LoginComponent.openLink': true }
]
