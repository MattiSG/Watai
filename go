#!/bin/bash

BASEDIR="$(cd `dirname $0`; pwd)"
BASEDIR=$BASEDIR/$(dirname $(readlink $0) 2> /dev/null)	# readlink for NPM global install alias; error redirection in case of direct invocation, in which case readlink returns nothing
SRC_DIR="$BASEDIR/src"
COVERAGE_DIR="$BASEDIR/coverage"
BIN_DIR="$BASEDIR/node_modules/.bin/"
TEST_DIR="$BASEDIR/test"
DOC_DIR="$BASEDIR/doc"
JSDOC_DIR="/usr/local/Cellar/jsdoc-toolkit/2.4.0/libexec/jsdoc-toolkit"	#TODO: make this more shareable
DIST_DIR="$BASEDIR/dist"
JSCOVERAGE="$BASEDIR/node_modules/visionmedia-jscoverage/jscoverage"

MOCHA_CMD="$BIN_DIR/mocha"

# Not all tests are run each time, as some are long and little prone to failure.
DEFAULT_TEST_DIRS="test/model test/controller test/functional test/lib"
# Used when running exhaustive tests.
ADDITIONAL_DIRS="test/main"

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

docToCodeRatio() {
	doc=$(egrep '^[	 ]*[/*]' -R src | wc -l)
	echo "$((doc)) lines of documentation"

	code=$(egrep '^[	 ]*[/*]' -Rv src | wc -l)
	empty=$(egrep '^[	 ]*$' -R src | wc -l)

	code=$(($code - $empty))
	echo "$code lines of code"

	echo "Doc to code ratio:" $(echo "scale=3; $doc / $code" | bc)
}


case "$1" in
	test )
		shift

		opts=""
		dirs=""

		if [[ $1 = "--exhaustive" ]]
		then shift
			 dirs="$DEFAULT_TEST_DIRS $ADDITIONAL_DIRS"

			 echo '****************'
			 echo 'Testing examples'
			 echo '****************'
			 if ./go 'example/DuckDuckGo' && ./go 'example/DuckDuckGo - advanced matchers' && ./go 'example/PDC'
			 then
			 	echo 'All examples pass'
			 else
			 	echo 'Some examples fail, cancelling tests'
			 	exit 1
			 fi
		fi

		for arg in "$@"
		do
			if echo $arg | grep -q '^\-\-'
			then opts="$arg $opts"
			else dirs="$dirs $TEST_DIR/$arg"	# allows for "go test controller" for example, instead of "go test test/controller"

			fi
		done

		if [[ -z $dirs ]]
		then dirs="$DEFAULT_TEST_DIRS"
		fi

		$MOCHA_CMD --bail $opts $dirs ;;
	coverage )	# based on http://tjholowaychuk.com/post/18175682663
		rm -rf $COVERAGE_DIR
		$JSCOVERAGE $SRC_DIR $COVERAGE_DIR
		export npm_config_coverage=true
		$MOCHA_CMD $DEFAULT_TEST_DIRS $ADDITIONAL_DIRS --reporter html-cov > $DOC_DIR/coverage.html &&
		open $DOC_DIR/coverage.html
		exit 0 ;;
	doc )
		docToCodeRatio
		if [[ $2 = "private" ]]
		then opts='-p'
		fi
		if ! java -Djsdoc.dir=$JSDOC_DIR -jar $JSDOC_DIR/jsrun.jar $JSDOC_DIR/app/run.js -t=$JSDOC_DIR/templates/jsdoc -d=$DOC_DIR/api $opts $SRC_DIR/*/*
		then exit 1
		fi
		open $DOC_DIR/api/index.html
		exit 0 ;;
	dev )
		echo "Temporarily disabling shrinkwrap…"
		mv "npm-shrinkwrap.json" "npm-shrinkwrap.json~"
		echo "Installing dev dependencies"
		npm install .
		echo "Re-enabling shrinkwrap"
		mv "npm-shrinkwrap.json~" "npm-shrinkwrap.json"
		exit 0 ;;
	export-examples )
		cd $BASEDIR
		outputFile="doc/tutorials/Watai-DuckDuckGo-example.zip"
		git archive -9 --output="$outputFile" HEAD example/DuckDuckGo/
		echo "Created $outputFile"
		outputFile="doc/tutorials/Watai-PDC-example.zip"
		git archive -9 --output="$outputFile" HEAD example/PDC/
		echo "Created $outputFile"
		cd - > /dev/null
		exit 0 ;;
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
		echo "Updating shrinwrap…"
		npm shrinkwrap
		echo "Restoring dev dependencies…"
		rm -rf node_modules
		mv node_modules_dev node_modules
		echo "Done."
		open dist
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
		cd "$DOC_DIR" &&
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
		node $SRC_DIR "$@" ;;
esac
