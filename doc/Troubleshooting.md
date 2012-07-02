I get `getaddrinfo ENOENT` exceptions whenever I try to execute a test
======================================================================

Symptom
-------

When running the program or executing its tests, you get the following error:

	Error: Unable to send request: getaddrinfo ENOENT
	
Reason
------
	
This means the Selenium server could not be reached. That server is responsible for forwarding automation instructions to managed browsers. If it is not available, WebDriverJS will exit brutally with the above error.

As the stack trace tells you, there is no easy way to catch this exception as the responsible code is called back from a timeout.

Steps
-----

### Is the Selenium server running? ###

You can check whether the server is available by accessing `127.0.0.1:4444/wd/hub` in a browser. If no page is displayed, then the server is not started (or you configured it differently, see step 2).

If you did not start the Selenium _standalone server_, [download it](https://code.google.com/p/selenium/downloads/list) (_server-standalone_, ok?) and start it in the background:

	java -jar path/to/downloaded/selenium-standalone.jar &


### Is the Selenium server properly accessed? ###

If you're sure the server JAR has been started up, but it can't be reached, then it could be that its URL is improperly set up.

The default connection URL is the default one provided by the server, i.e. `127.0.0.1:4444/wd/hub`. If you configured Selenium otherwise, or have an IPv6-only network, or whatever else, you have to override this value in the `config.js` file, at the `connectURL` key.
