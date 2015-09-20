#!/bin/bash

BASEDIR="$(cd `dirname $0`; pwd)"
BASEDIR=$BASEDIR/$(dirname $(readlink $0) 2> /dev/null)	# readlink for NPM global install alias; error redirection in case of direct invocation, in which case readlink returns nothing
DIST_DIR="$BASEDIR/dist"

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
esac
