/**@class	A matcher piece that calls `compare` on its element's text.
*/
var TextExtractor = new Class( /** @lends matchers.TextExtractor# */ {
	/** The attribute that should be extracted from the element.
	* If not defined, defaults to using this class' `type` property.
	*
	*@type	{String}
	*/
	attribute: null,

	onElementFound: function(element) {
		element.text().done(this.compare, this.fail);
	}
});

module.exports = TextExtractor;	// CommonJS export
