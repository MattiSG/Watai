clockLookupTown = 'Gatwick'

/** Translates a 24-hours based hour by the given amount of hours.
*
*@param	{Number}	hour	The hour to translate.
*@param	{Number}	diff	The displacement to apply.
*/
function timeDiff(hour, diff) {
	return ((hour + diff) + 24) % 24;
}
