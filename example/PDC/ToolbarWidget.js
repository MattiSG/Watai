{
	elements: {
		username:	{ xpath: '//article[@id="login"]/section[2]/span' },
		logoutLink:	{ xpath: '//article[@id="login"]/section[2]/a[2]' },
		editUserLink:{ xpath: '//article[@id="login"]/section[2]/a[1]' }
	},
	
	logout: function() {
		return this.logoutLink.click();
	},
	
	editUser: function() {
		return this.editUserLink.click();
	}
}
