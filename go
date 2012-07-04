#!/bin/bash

SRC_DIR="src"
BUILD_DIR="build"
TEST_DIR="test"
DOC_DIR="doc"
JSDOC_DIR="/usr/local/jsdoc_toolkit-2.4.0/jsdoc-toolkit"	#TODO: make this more shareable?

case "$1" in
	test )
		mocha $TEST_DIR ;;
	coverage )	# based on http://tjholowaychuk.com/post/18175682663
		rm -rf $BUILD_DIR
		jscoverage $SRC_DIR $BUILD_DIR	# install from https://github.com/visionmedia/node-jscoverage
		export COVERAGE=true
		mocha $TEST_DIR --reporter html-cov > $TEST_DIR/coverage.html
		open $TEST_DIR/coverage.html ;;
	doc )
		java -Djsdoc.dir=$JSDOC_DIR -jar $JSDOC_DIR/jsrun.jar $JSDOC_DIR/app/run.js -t=$JSDOC_DIR/templates/jsdoc -d=$DOC_DIR/api $SRC_DIR/*
		open $DOC_DIR/api/index.html ;;
	* ) # simply run the tool
		node src "$*" ;;
esac

