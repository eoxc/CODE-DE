module.exports = {
  "extends": "airbnb",
  "env": {
    "browser": true,
    "jquery": true,
    "commonjs": true,
    "es6": true,
  },
  "globals": {
       "_": false,
   },
  "rules": {
    "comma-dangle": ["error", {
      "functions": "ignore",
      "arrays": "only-multiline",
      "objects": "only-multiline",
    }],
  },
};
