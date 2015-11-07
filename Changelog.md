Changelog
=========

This document logs all user-impacting changes between officially-published, NPM-available, stable versions of Watai.
On development branches (i.e. not `master`), it may also log changes between development versions, which will be concatenated on publication.

To get all details, and changes at all versions, including development ones, use `git tag -n20` or use GitHub’s [releases](https://github.com/MattiSG/Watai/releases).

### Versioning

You are reminded that Watai uses [SemVer](http://semver.org), which means upgrades that have only a patch number (last digit) change are backwards-compatible, and versions with a minor number (second digit) are API-breaking while in `0` major versions.


v0.7
----

### v0.7.0

#### Breaking changes

An [upgrade guide](https://github.com/MattiSG/Watai/wiki/Upgrading-from-v0-6-to-v0-7) is available to help you update your tests through breaking changes.

- Renamed following concepts ([#116](https://github.com/MattiSG/Watai/issues/116)):
  - `Feature` to `Scenario`.
  - `Scenario` to `Steps` (inside a feature/scenario)
  - `Flow` to `Verbose`.
  - `Data` to `Fixture`.
  - `Hook` to `Locator`.
  - `Widget` to `Component`.

Backward compatibility is kept for this version, but support for previous names is deprecated and will be removed in a later version. Feedback on these names welcome.

#### Minor changes

- Added compatibility with NPM 3.
- Update documentation generation tool from JSdoc 2 to [JSdoc 3](http://usejsdoc.org).


v0.6
----

### v0.6.2

#### New features

- [`ignore`](https://github.com/MattiSG/Watai/wiki/Configuration#wiki-ignore) config option has been added ([#111](https://github.com/MattiSG/Watai/pull/111), thanks @debona).
- [SauceLabs](https://github.com/MattiSG/Watai/wiki/Configuration#wiki-views) view is now available, transmitting test status as pass/fail and outputting a direct link to the job as well as an estimate of how many minutes are left on your account ([#87](https://github.com/MattiSG/Watai/issues/87)).

#### Minor changes

- Upgraded obsolete object getters and setters syntax ([#107](https://github.com/MattiSG/Watai/pull/107)).
- Updated `wd` to v0.2.6. [Some incompatibilities](https://github.com/admc/wd/blob/master/doc/release-notes.md#022) were introduced in v0.2.2. They are in advanced monkeypatching usage, you probably didn't do any with Watai.
- Added an [`editorconfig`](http://editorconfig.org/) file to help contributors ([#118](https://github.com/MattiSG/Watai/pull/118), thanks @GillesFabio).
- Added [`jscs`](https://github.com/mdevils/node-jscs) to unify syntax and guide contributors ([#119](https://github.com/MattiSG/Watai/pull/119), thanks @GillesFabio).

#### Bugfixes

- Errors appearing on suite load are now visible ([#112](https://github.com/MattiSG/Watai/pull/112), thanks @debona).


### v0.6.1

#### Minor changes

- Async configuration entries can now [use a promise](https://github.com/MattiSG/Watai/wiki/Configuration#wiki-async-config) instead of a callback. This allows for async errors to be detected.
- Improve display of unknown errors.
- Important improvements in development tools.
- Use native `Q`'s long stack traces instead of `longjohn` module.


### v0.6.0

#### New features

- Automatic file upload support: if you set a file field to a local file path, the file will be [sent to the Selenium server](http://sauceio.com/index.php/2012/03/selenium-tips-uploading-files-in-remote-webdriver/), making test assets available anywhere automatically.
- Add [support for (async) functions in configuration](https://github.com/MattiSG/Watai/wiki/Configuration#async-config).
- Add [`bail` config key](https://github.com/MattiSG/Watai/wiki/Configuration#wiki-bail): if set to `true`, stops a test after the first failing feature.
- Almost all errors now have a proper description (server not reachable, elements not found in state assertions, widget actions failures…).
- Authentication data is now taken from [`seleniumServerURL`](https://github.com/MattiSG/Watai/wiki/Configuration#wiki-seleniumserverurl), allowing distant services such as SauceLabs to be used.
- [Metadata fields](https://github.com/MattiSG/Watai/wiki/Configuration#metadata) `name`, `tags` and `build` are now parsed in config files and sent to the Selenium server.
- There is now a default hook type: `css` ([#92](https://github.com/MattiSG/Watai/pull/92)). If you target an element with only a String, it will be considered as a CSS selector.

#### Breaking changes

An [upgrade guide](https://github.com/MattiSG/Watai/wiki/Upgrading-from-v0-5-to-v0-6) is available to help you update your tests through breaking changes.

- Widgets' elements and actions are now declared in a single hash ([#94](https://github.com/MattiSG/Watai/pull/94)). Your existing Widgets will need to have their `elements` key removed.
- Widgets and Features don't need an enclosing curly braces anymore ([#91](https://github.com/MattiSG/Watai/pull/91)). Your existing Widgets and Features will need to have their enclosing curly braces removed.
- Textual content matches against Strings or RegExps only, not Numbers anymore (reserving for later use) nor any other Object (preventing errors).
- `Runner.driverInit` event is not fired anymore. API clients should use the `Runner.start` event instead.
- `Runner.restart` event is not fired anymore. API clients should use the `Runner.start` event instead.

#### Minor changes

- Switch to [WD](https://github.com/admc/wd) as the underlying library ([#89](https://github.com/MattiSG/Watai/pull/89)).
- Growl view gives much more details.
- Explicit setters (`set<ElementName>`) now have precedence over magic setters.
- `--installed` exits with `1` instead of `3` if Watai is not installed properly.

#### Bugfixes

- Compatibility with Node 0.10 has improved ([#90](https://github.com/MattiSG/Watai/pull/90)).


v0.5
----

### v0.5.2

#### New features

-  Config may be set through (a)sync functions.

#### Minor changes

- Q promises updated to 0.9.6, bringing many new possibilities for API clients.


### v0.5.1

#### New features

- Add a `--config` option to override config at run time.
- Add a `--setup` option to override setup at run time.
- URLs in config (base, selenium) may be provided as URL objects instead of pure strings, allowing for specific overrides. Compatibility with strings is still offered, and will be maintained.
- Add a `browser` config shortcut with usual defaults for `desiredCapabilities`.
- Default view now includes "Instafail".

#### Minor changes

- Failure reports now give the exact spent time, not the expected timeout.
- Setup options are now loaded from setup files. This is not considered breaking since loading them from config never worked.
- Minor visual improvements to the Flow view.

#### Bugfixes

- Fix default config values not being loaded in some cases.


### v0.5.0

#### New features

- Add "Flow" view, a more detailed step-by-step view of all actions, non-interactive for compatibility with headless environments.
- Add "PageDump" view: if activated, a failure in the first feature will trigger a page source dump. Useful in headless environments.
- Report failures in real-time.
- Show feature ID for easier identification.
- Warn when no features are found in a suite.
- Add magic for "Option" elements.

#### Breaking changes

- Only one suite may be loaded at a time, no more CLI varargs.

#### Minor changes

- Much improved tests speed.
- "test" is now a valid suite name.
- Remove the need for log-level config tweaking.
- Made magic methods much more resilient.
- Correct a minor Dots view summary phrasing inconsistency.
- Improve missing elements tests performance.


v0.4
----

### v0.4.5

#### New features

- Add 'Instafail' view.

#### Minor changes

- Improve CLI animator and view management system.


### v0.4.4

#### Minor changes

- Prevent magically-added shortcuts from being referenced in state assertions by mistake.


### v0.4.3

#### Minor changes

- Improve Function matchers output in case of failure.

#### Bugfixes

- Ensure cursor is redrawn even after a failure.


### v0.4.2

#### New features

- User-provided functions may be used in state descriptions.

#### Bugfixes

- Fix DuckDuckGo examples for non-English systems.


### v0.4.1

#### New features

- RegExp matchers may now be used on value attributes.
- Add magic setters to send keystrokes to elements: `set<ElementName>(input)`. These wrap WebDriver failures, unlike assignment setters.

#### Breaking changes

- Change syntax for action calls: call them as if they were immediate functions.


### From the 0.3 series

#### New features

- Return status code 1 on tests fail.
- Add `--version` option.
- Scenarios warn if an undefined step is used.
- Offer a "dots" view for non-interactive environments.

#### Breaking changes

- Boolean state descriptors now describe visibility instead of DOM existence.
- The obsolete `Widget.has` syntax is removed.
- Scenario functions now have their parameters passed directly as array elements, not embedded in another array.

#### Minor changes

- `--help` exits with 0.
- Dots view logs browser readiness.
- All feature scenario steps now respect a timeout, even if WebDriver raises errors when executing one.

#### Bugfixes

- Fixed Dots view crash on error reports.


v0.2
----

### v0.2.9

First public, and last stable version, in the 0.2 series.
