module.exports = function(TR, driver) {
	return new TR.Widget('zeroclick', {
		elements: {
			header:		{ id: 'zero_click_heading' }
		}
	}, driver);
}
