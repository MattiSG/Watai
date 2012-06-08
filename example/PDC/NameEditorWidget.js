module.exports = function(TR, driver) {
	return new TR.Widget('login', {
//		root: { css: 'form[action=/utilisateur]' }, //TODO
		
		elements: {
			username:		{ id: 'profile_display_name' }
		},
		
		setUsername: function setUsername(newName) {
			this.username = newName;
			this.username.submit();
		}
	}, driver);
}
