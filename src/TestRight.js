var webdriver = require('/Users/eurogiciel/Documents/Ghost/selenium/build/javascript/webdriver/webdriver');


var driver = new webdriver.Builder()
						  .usingServer('http://localhost:4444/wd/hub')
						  .withCapabilities({
							  'browserName': 'firefox',
							  'version': '',
							  'platform': 'ANY',
							  'javascriptEnabled': true,
							  'chrome.binary': '/Applications/Browsers/Google Chrome.app/Contents/MacOS/Google Chrome',
							  'firefox_binary': '/Applications/Browsers/Firefox.app/Contents/MacOS/firefox',
						  })
						  .build();

driver.get('http://www.google.com');
driver.findElement(webdriver.By.name('q')).sendKeys('webdriver');
driver.findElement(webdriver.By.name('btnG')).click().then(function() {
	driver.getTitle().then(function(title) {
		try {
			require('assert').equal('Google - ', title);
		} catch (error) {
			driver.quit();
		}
	});
});
