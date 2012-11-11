{
	description: 'A user should be able to ask for an account',
	
	scenario: [
		RegisterWidget.register, firstName, lastName,
		{
			'RegisterWidget.firstName': firstName,
			'RegisterWidget.lastName': lastName
		}
	]
}
