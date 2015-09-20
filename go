#!/bin/bash

BASEDIR="$(cd `dirname $0`; pwd)"
BASEDIR=$BASEDIR/$(dirname $(readlink $0) 2> /dev/null)	# readlink for NPM global install alias; error redirection in case of direct invocation, in which case readlink returns nothing


case "$1" in
	export-examples )
		cd $BASEDIR
		outputFile="doc/tutorials/Watai-DuckDuckGo-example.zip"
		git archive -9 --output="$outputFile" HEAD example/DuckDuckGo/
		echo "Created $outputFile"
		cd - > /dev/null
		exit 0 ;;
esac
