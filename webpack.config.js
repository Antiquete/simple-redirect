/** @format */
const path = require("path");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  mode: "production",
  entry: {
    popup: "./src/ui/popup.js",
    editor: "./src/ui/editor.js",
    settings: "./src/ui/settings.js",
  },
  devtool: "cheap-module-source-map",
  output: {
    path: path.resolve(__dirname, "ui"),
    filename: "[name].bundle.js",
  },
  node: {
    fs: "empty",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: ["css-loader", "sass-loader"],
        }),
      },
      {
        test: /\.sass$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: ["css-loader", "sass-loader"],
        }),
      },
    ],
  },
  plugins: [new ExtractTextPlugin("theme.css")],
};
