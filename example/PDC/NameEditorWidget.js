elements: {
	usernameField: { id: 'profile_display_name' }
},

setUsername: function setUsername(newName) {
	return	this.setUsernameField(newName)()
				.then(driver.submit.bind(driver));
}
