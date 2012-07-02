#!/bin/bash

SRC_DIR="src"
BUILD_DIR="build"
TEST_DIR="test"

case "$1" in
	test )
		mocha $TEST_DIR ;;
	coverage )	# based on http://tjholowaychuk.com/post/18175682663
		rm -rf $BUILD_DIR
		jscoverage $SRC_DIR $BUILD_DIR	# install from https://github.com/visionmedia/node-jscoverage
		export COVERAGE=true
		mocha $TEST_DIR --reporter html-cov > $TEST_DIR/coverage.html
		open $TEST_DIR/coverage.html ;;
	* ) # simply run the tool
		node src "$*" ;;
esac

