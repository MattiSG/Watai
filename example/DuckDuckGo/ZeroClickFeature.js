module.exports = function(TR, driver) {
	var lookupTerm = 'Toto';
	
	return new TR.Feature("Looking up an ambiguous term should make the Zero-Click toolbox appear.", [
		SearchBarWidget.searchFor, [lookupTerm],
		{ 'ZeroClickWidget.header': 'Meanings of ' + lookupTerm }
	]);
}