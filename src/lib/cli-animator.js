/** Indirection to get the CLI animator most fit for the execution platform.
*/

module.exports = require(process.platform.win32
						 ? './cli-animator-windows'
						 : './cli-animator-posix');
