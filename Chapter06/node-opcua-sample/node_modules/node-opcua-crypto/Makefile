
test-cov: istanbul coveralls codeclimate

istanbul:
	istanbul cover -x "tmp/**" ./node_modules/mocha/bin/_mocha -- -R spec --recursive --timeout 100000 --bail test

coveralls: istanbul
	npm install coveralls 
	cat ./coverage/lcov.info | node ./node_modules/coveralls/bin/coveralls.js --exclude tmp

# note a CODECLIMATE_REPO_TOKEN must be specified as an environment variable.
codeclimate: istanbul
	npm install -g codeclimate-test-reporter
	codeclimate-test-reporter < ./coverage/lcov.info


