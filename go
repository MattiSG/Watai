#!/bin/bash

BASEDIR="$(dirname $0)"
BASEDIR=$BASEDIR/$(dirname $(readlink $0) 2> /dev/null)	# readlink for NPM global install alias; error redirection in case of direct invocation, in which case readlink returns nothing
SRC_DIR="$BASEDIR/src"
BUILD_DIR="$BASEDIR/build"
TEST_DIR="$BASEDIR/test"
DOC_DIR="$BASEDIR/doc"
JSDOC_DIR="/usr/local/jsdoc_toolkit-2.4.0/jsdoc-toolkit"	#TODO: make this more shareable?


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
		mocha $TEST_DIR ;;
	coverage )	# based on http://tjholowaychuk.com/post/18175682663
		rm -rf $BUILD_DIR
		jscoverage $SRC_DIR $BUILD_DIR	# install from https://github.com/visionmedia/node-jscoverage
		export npm_config_coverage=true
		mocha $TEST_DIR --reporter html-cov > $TEST_DIR/coverage.html &&
		open $TEST_DIR/coverage.html ;;
	doc )
		java -Djsdoc.dir=$JSDOC_DIR -jar $JSDOC_DIR/jsrun.jar $JSDOC_DIR/app/run.js -t=$JSDOC_DIR/templates/jsdoc -d=$DOC_DIR/api $SRC_DIR/*
		open $DOC_DIR/api/index.html ;;
	export-example )
		git archive -9 --output="doc/tutorials/Watai-DuckDuckGo-example.zip" HEAD example/DuckDuckGo/ ;;
	* ) # simply run the tool
		node $SRC_DIR "$@" ;;
esac
