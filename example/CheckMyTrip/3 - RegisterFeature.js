description: 'A user should be able to request an account',

scenario: [
	RegisterComponent.register(firstName, lastName),
	{
		'RegisterComponent.firstName'	: firstName,
		'RegisterComponent.lastName'	: lastName
	}
]
