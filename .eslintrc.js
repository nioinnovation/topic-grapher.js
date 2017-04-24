module.exports = {
  "extends": [
    "airbnb-base",
    "plugin:flowtype/recommended"
  ],
  "parser": "babel-eslint",
  "plugins": [
    "import",
    "flowtype"
  ],
  "rules": {
    "no-nested-ternary": 0,
    "react/require-default-props": 0
  }
};
