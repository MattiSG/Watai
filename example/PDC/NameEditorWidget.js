module.exports = function(TR, driver) {
	return new TR.Widget('login', {
//		root: { css: 'form[action=/utilisateur]' }, //TODO
		
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
	}, driver);
}
