const packageJson = require('../package.json');
// to enable opensearchworker loading in dev-server
__webpack_public_path__ = require('script-path')(`code-de.${packageJson.version}`);
