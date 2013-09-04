description: 'A user should be able to log out',

scenario: [
	ToolbarWidget.logout(),
	{ 'LoginWidget.openLink': true }
]
