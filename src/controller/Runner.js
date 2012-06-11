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
	
	handleFeatureResult: function handleFeatureResult(feature, message) {
		console.log((message === true ? '✔' : '✘') + '	' + feature.description);

		if (message !== true) {
			console.log('	' + message);
			this.failed = true;
		}
		
		this.currentFeature++;
				
		if (this.currentFeature < this.features.length)
			this.evaluateFeature(this.features[this.currentFeature]);
		else
			this.driver.quit();
	},
	
	evaluateFeature: function evaluateFeature(feature) {
		try {
			feature.test().then(this.handleFeatureResult.bind(this, feature, true),
								this.handleFeatureResult.bind(this, feature)); // leave last arg to pass failure description
		} catch (error) {
			growl('Error!\n' + error, { priority: 4 });
			throw error;
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
