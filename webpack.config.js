const path = require("path");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const siteConfig = require("./src/config/site.config.json");

const TEMPLATE_PATH = path.resolve(__dirname, "./src/templates");

let htmlPlugins = [];
let jsEntryPaths = {};
for (const key in siteConfig.pages) {
  if (Object.hasOwnProperty.call(siteConfig.pages, key)) {
    const page = siteConfig.pages[key];
    // add the htmls
    htmlPlugins.push(
      new HtmlWebpackPlugin({
        template: `${TEMPLATE_PATH}/${key}.html`,
        filename: `${key}.html`,
        chunks: [`${key}`],
      })
    );
    // add entry paths for js
    jsEntryPaths[`${key}`] = path.resolve(__dirname, `${page.path}/index.js`);
  }
}

module.exports = {
  mode: "development",
  entry: jsEntryPaths,
  output: {
    path: path.resolve(__dirname, "public"),
    filename: "[name].bundle.js",
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.(scss|css)$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
      },
    ],
  },
  plugins: [new MiniCssExtractPlugin()].concat(htmlPlugins),
};
