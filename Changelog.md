Changelog
=========

This document logs all user-impacting changes between officially-published, NPM-available, stable versions of Watai.
On development branches (i.e. not `master`), it may also log changes between development versions, which will be concatenated on publication.

To get all details, and changes at all versions, including development ones, use `git tag -n20` or use GitHub’s [releases](https://github.com/MattiSG/Watai/releases).

### Versioning

You are reminded that Watai uses [SemVer](http://semver.org), which means upgrades that have only a patch number (last digit) change are backwards-compatible, and versions with a minor number (second digit) are possibly API-breaking.


### Syntax

To simplify upgrades, each line in a changelog message is prefixed with one of the following symbols:

- `+`: new feature
- `!`: breaking change, will most likely need an update of your tests
- `~`: minor behavior change, might impact your tests or usage on some cases
- `#`: bugfix

Writers: use the present tense.


v0.6 [IN PROGRESS]
----

`+` Automatic file upload support
`+` Add support for async functions in configuration
`+` Add `bail` config key: if set to `true`, stops a test after the first failing feature
`+` Almost all errors now have a proper description (server not reachable, elements not found in state assertions…)
`!` Content matches against a String only
`!` `Runner.driverInit` event is not fired anymore. API clients should use the `Runner.start` event instead.
`~` Switch to [WD](https://github.com/admc/wd) as the underlying library
`~` Growl view gives much more details


v0.5
----

### v0.5.2

`+` Config may be set through (a)sync functions
`~` Q promises updated to 0.9.6, bringing many new possibilities for API clients.


### v0.5.1

`+` Add a `--config` option to override config at run time
`+` Add a `--setup` option to override setup at run time
`+` URLs in config (base, selenium) may be provided as URL objects instead of pure strings, allowing for specific overrides. Compatibility with strings is still offered, and will be maintained.
`+` Add a `browser` config shortcut with usual defaults for `desiredCapabilities`
`+` Default view now includes "Instafail"
`~` Failure reports now give the exact spent time, not the expected timeout
`~` Setup options are now loaded from setup files. This is not considered breaking since loading them from config never worked.
`~` Minor visual improvements to the Flow view
`#` Fix default config values not being loaded in some cases


### v0.5.0

`+` Add "Flow" view, a more detailed step-by-step view of all actions, non-interactive for compatibility with headless environments.
`+` Add "PageDump" view: if activated, a failure in the first feature will trigger a page source dump. Useful in headless environments.
`+` Report failures in real-time
`+` Show feature ID for easier identification
`+` Warn when no features are found in a suite
`+` Add magic for "Option" elements
`!` Only one suite may be loaded at a time, no more CLI varargs
`~` Much improved tests speed
`~` "test" is now a valid suite name
`~` Remove the need for log-level config tweaking
`~` Made magic methods much more resilient
`~` Correct a minor Dots view summary phrasing inconsistency
`~` Improve missing elements tests performance


v0.4
----

### v0.4.5

`+` Add 'Instafail' view
`~` Improve CLI animator and view management system


### v0.4.4

`~` Prevent magically-added shortcuts from being referenced in state assertions by mistake.


### v0.4.3

`~` Improve Function matchers output in case of failure
`#` Ensure cursor is redrawn even after a failure


### v0.4.2
`+` User-provided functions may be used in state descriptions.
`#` Fix DuckDuckGo examples for non-English systems


### v0.4.1

`+` RegExp matchers may now be used on value attributes
`+` Add magic setters to send keystrokes to elements: `set<ElementName>(input)`. These wrap WebDriver failures, unlike assignment setters.
`!` Change syntax for action calls: call them as if they were immediate functions.


### From the 0.3 series

`+` Return status code 1 on tests fail.
`+` Add `--version` option.
`+` Scenarios warn if an undefined step is used.
`+` Offer a "dots" view for non-interactive environments.
`!` Boolean state descriptors now describe visibility instead of DOM existence.
`!` The obsolete `Widget.has` syntax is removed.
`!` Scenario functions now have their parameters passed directly as array elements, not embedded in another array.
`~` `--help` exits with 0.
`~` Dots view logs browser readiness.
`~` All feature scenario steps now respect a timeout, even if WebDriver raises errors when executing one.
`#` Fixed Dots view crash on error reports.


v0.2
----

### v0.2.9

First public, and last stable version, in the 0.2 series.
