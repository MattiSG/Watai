#!/bin/bash

BASEDIR="$(dirname $0)"
BASEDIR=$BASEDIR/$(dirname $(readlink $0) 2> /dev/null)	# readlink for NPM global install alias; error redirection in case of direct invocation, in which case readlink returns nothing
SRC_DIR="$BASEDIR/src"
BUILD_DIR="$BASEDIR/build"
BIN_DIR="$BASEDIR/node_modules/.bin/"
TEST_DIR="$BASEDIR/test"
DOC_DIR="$BASEDIR/doc"
JSDOC_DIR="/usr/local/Cellar/jsdoc-toolkit/2.4.0/libexec/jsdoc-toolkit"	#TODO: make this more shareable
DIST_DIR="$BASEDIR/dist"
JSCOVERAGE="$BASEDIR/node_modules/visionmedia-jscoverage/jscoverage"

MOCHA_CMD="$BIN_DIR/mocha $TEST_DIR" # longer timeout because async tests can be a bit longer than the default 2s
DIST_INCLUDE="package.json go src README.md" # list all files / folders to be included when `dist`ing, separated by spaces; this is a copy of npm’s "files", couldn't find an easy way to parse it


# Cross-platform Darwin open(1)
# Simply add this function definition above any OSX script that uses the “open” command
# For additional information on the “open” command, see https://developer.apple.com/library/mac/#documentation/darwin/reference/manpages/man1/open.1.html
open() {
	if [[ $(uname) = "Darwin" ]]
	then /usr/bin/open "$@"	#OS X
	else xdg-open "$@" &> /dev/null &	# credit: http://stackoverflow.com/questions/264395
	fi
}


case "$1" in
	test )
		$MOCHA_CMD --reporter spec ;;
	coverage )	# based on http://tjholowaychuk.com/post/18175682663
		rm -rf $BUILD_DIR
		$JSCOVERAGE $SRC_DIR $BUILD_DIR
		export npm_config_coverage=true
		$MOCHA_CMD --reporter html-cov > $TEST_DIR/coverage.html &&
		open $TEST_DIR/coverage.html ;;
	doc )
		if [[ $2 = "private" ]]
		then opts='-p'
		fi
		java -Djsdoc.dir=$JSDOC_DIR -jar $JSDOC_DIR/jsrun.jar $JSDOC_DIR/app/run.js -t=$JSDOC_DIR/templates/jsdoc -d=$DOC_DIR/api $opts $SRC_DIR/*
		open $DOC_DIR/api/index.html ;;
	export-examples )
		cd $BASEDIR
		outputFile="doc/tutorials/Watai-DuckDuckGo-example.zip"
		git archive -9 --output="$outputFile" HEAD example/DuckDuckGo/
		echo "Created $outputFile"
		outputFile="doc/tutorials/Watai-PDC-example.zip"
		git archive -9 --output="$outputFile" HEAD example/PDC/
		echo "Created $outputFile"
		cd - > /dev/null ;;
	dist )
		cd $BASEDIR
		outputFile=dist/watai-$(git describe)-NPMdeps.zip
		mkdir dist 2> /dev/null
		git archive -9 --output="$outputFile" $(git describe) $DIST_INCLUDE
		echo "Archived repository"
		echo "Adding production dependencies…"
		mv node_modules node_modules_dev
		npm install --prod
		zip -q -u $outputFile -r node_modules
		echo "Restoring dev dependencies…"
		rm -rf node_modules
		mv node_modules_dev node_modules
		echo "Done."
		open dist
		cd - > /dev/null ;;
	publish )	# marks this version as the latest, tags, pushes, publishes; params: <version> <message>
		if ! git branch | grep -q "* master"
		then
			echo "Not in master branch! Deployment cancelled."
			echo "Merge your changes and deploy from master."
			echo "Deploying a feature branch is bad practice: what if you can't merge properly?"
			exit 1
		fi
		./go test &&
		./go dist &&
		cd $DOC_DIR &&
		git commit -a -m "[AUTO] Updated examples for publication." &&
		git tag $2 -m $3 &&
		git push &&
		git push --tags &&
		cd $BASEDIR &&
		npm version $2 --message $3	&& # also updates Git
		git push &&
		git push --tags &&
		npm publish ;;
	* ) # simply run the tool
		node $SRC_DIR "$@" ;;
esac
