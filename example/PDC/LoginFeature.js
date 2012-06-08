module.exports = function(TR, driver) {
	return new TR.Feature("A user should be able to log in", [
		LoginWidget.open,
		LoginWidget.login.bind(LoginWidget, 'toto@toto.com', 'tototo'),
		
		{ 'ToolbarWidget.username': '0' }
	]);
}
