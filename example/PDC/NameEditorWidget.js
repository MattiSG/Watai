usernameField: '#profile_display_name',

setUsername: function setUsername(newName) {
	return	this.setUsernameField(newName)()	// (yes, this syntax is ugly and will be fixed in an upcoming release, see issue #99)
				.then(driver.submit.bind(driver));
}
