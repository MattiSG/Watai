description: 'A user should be able to request an account',

steps: [
	RegisterComponent.register(firstName, lastName),
	{
		'RegisterComponent.firstName'	: firstName,
		'RegisterComponent.lastName'	: lastName
	}
]
