{
	description: 'A user should be able to request an account',

	scenario: [
		RegisterWidget.register(firstName, lastName),
		{
			'RegisterWidget.firstName'	: firstName,
			'RegisterWidget.lastName'	: lastName
		}
	]
}
