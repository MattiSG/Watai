var TR = require('../../src/TestRight.js');


var runner = new TR.Runner(require('./config'));

runner.addFeature(require('./LoginFeature')(TR, runner.getDriver()));

runner.run();
