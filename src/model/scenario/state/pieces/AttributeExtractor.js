/**@class	A matcher piece that calls `compare` on the given extracted attribute.
*/
var AttributeExtractor = new Class( /** @lends matchers.AttributeExtractor# */ {
	/** The attribute that should be extracted from the element.
	* If not defined, defaults to using this class' `type` property.
	*
	*@type	{String}
	*/
	attribute: null,

	onElementFound: function(element) {
		element.getAttribute(this.attribute || this.type).done(this.compare, this.fail);
	}
});

module.exports = AttributeExtractor;	// CommonJS export
