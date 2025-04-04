const config = require('@nielsen-media/maf-frontend-eslint-config')
config.extends.push("plugin:react-hooks/recommended-legacy")
config.parser = "babel-eslint"
config.parserOptions.sourceType = "module"

module.exports = config

