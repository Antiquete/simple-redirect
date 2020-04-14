/** @format */

module.exports = {
  artifactsDir: "zips",
  ignoreFiles: [
    // System Specific Confifuration
    "simple_redirect.code-workspace",

    // Third Party Code
    "node_modules",

    // Git Tracking
    ".git",
    ".gitignore",

    // Dev Configurations
    "package.json",
    "package-lock.json",
    "webpack.config.js",
    "web-ext-config.js",

    // Source
    "src",

    // Build Files
    "web-ext-artifacts/*",
  ],
  build: {
    overwriteDest: true,
  },
  lint: {
    output: "text",
  },
};
