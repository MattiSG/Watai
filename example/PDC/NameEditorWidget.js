{
	elements: {
		username:		{ id: 'profile_display_name' }
	},
	
	getUsername: function getUsername() {
		return this.username.getAttribute('value');
	},
	
	setUsername: function setUsername(newName) {
		this.username.clear();
		this.username = newName;
		return this.username.submit();
	}
}
