#!/bin/bash

BASEDIR="$(cd `dirname $0`; pwd)"
BASEDIR=$BASEDIR/$(dirname $(readlink $0) 2> /dev/null)	# readlink for NPM global install alias; error redirection in case of direct invocation, in which case readlink returns nothing
SRC_DIR="$BASEDIR/src"
COVERAGE_DIR="$BASEDIR/coverage"
BIN_DIR="$BASEDIR/node_modules/.bin/"
TEST_DIR="$BASEDIR/test"
DIST_DIR="$BASEDIR/dist"
JSCOVERAGE="$BASEDIR/node_modules/visionmedia-jscoverage/jscoverage"

MOCHA_CMD="$BIN_DIR/mocha"

# Not all tests are run each time, as some are long and little prone to failure.
DEFAULT_TEST_DIRS="test/model test/controller test/functional test/lib test/view"
# Used when running exhaustive tests.
ADDITIONAL_DIRS="test/main"

DIST_INCLUDE="package.json go src README.md" # list all files / folders to be included when `dist`ing, separated by spaces; this is a copy of npm’s "files", couldn't find an easy way to parse it


case "$1" in
	export-examples )
		cd $BASEDIR
		outputFile="doc/tutorials/Watai-DuckDuckGo-example.zip"
		git archive -9 --output="$outputFile" HEAD example/DuckDuckGo/
		echo "Created $outputFile"
		cd - > /dev/null
		exit 0 ;;
	dist )
		$0 export-examples
		cd $BASEDIR
		outputFile=$DIST_DIR/watai-$(git describe --tags)-with-npm-dependencies.zip
		mkdir $DIST_DIR 2> /dev/null
		git archive -9 --output="$outputFile" $(git describe) $DIST_INCLUDE
		echo "Archived repository"
		echo "Adding production dependencies…"
		mv node_modules node_modules_dev
		npm install --production
		zip -q -u $outputFile -r node_modules
		echo "Restoring dev dependencies…"
		rm -rf node_modules
		mv node_modules_dev node_modules
		echo "Wrote to $DIST_DIR"
		cd - > /dev/null
		exit 0 ;;
	publish )	# marks this version as the latest, tags, pushes, publishes; params: <version> <message>
		if ! git branch | grep -q "* master"
		then
			echo "Not in master branch! Deployment cancelled."
			echo "Merge your changes and deploy from master."
			echo "Deploying a feature branch is bad practice: what if you can't merge properly?"
			exit 1
		fi
		if ! ./go test
		then exit 1
		fi
#		./go export-examples &&	#TODO: update examples only if needed
#		git commit -a -m "[AUTO] Updated examples for publication." &&
		git tag -m "$3" $2 &&
		git push &&
		git push --tags
		cd - &&
		npm version $2 --message "$3"	&& # also updates Git
		git push &&
		git push --tags &&
		npm publish &&
		./go dist ;;
	debug )	# run the tool in debug mode
		shift
		node debug $SRC_DIR "$@" ;;
	* )	# simply run the tool
		$SRC_DIR/index.js "$@" ;;
esac
