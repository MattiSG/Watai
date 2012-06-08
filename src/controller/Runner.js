var webdriver = require('/Users/eurogiciel/Documents/Ghost/selenium/build/javascript/webdriver/webdriver');
var growl = require('growl');


module.exports = new Class({
	/** Whether any test did fail during the current run or not.
	*/
	failed: false,

	/**
	*/
	initialize: function init(config) {
		this.config = config;
		this.features = [];
		
		this.driver = new webdriver.Builder()
						.usingServer('http://localhost:4444/wd/hub')
						.withCapabilities(config.driverCapabilities)
						.build();
						
		DRIVER = this.driver;
	},
	
	/**
	*@param	feature	A Feature for this Runner to evaluate.
	*/
	addFeature: function addFeature(feature) {
		this.features.unshift(feature);
	},
	
	/** Returns the WebDriver instance this Runner created for the current run.
	*/
	getDriver: function getDriver() {
		return this.driver;
	},
	
	handleFeatureResult: function handleFeatureResult(feature, succeeded) {
		console.log((succeeded ? '✔' : '✘') + '	' + feature.description);
		
		this.currentFeature++;
		
		if (this.currentFeature < this.features.length)
			this.evaluateFeature(this.features[this.currentFeature]);
		
		if (! succeeded)
			this.failed = true;
	},
	
	evaluateFeature: function evaluateFeature(feature) {
		try {
			feature.test(this.handleFeatureResult.bind(this, feature));
		} catch (error) {
			growl('Error!\n' + error, { priority: 4 });
			throw error;
		} finally {
			this.driver.quit();
		}
	},
	
	run: function run() {
		this.failed = false;
		this.currentFeature = 0;

		var runner = this;
		this.driver.get(this.config.baseURL).then(function() {
			runner.evaluateFeature(runner.features[0]);
		});
	}
});
