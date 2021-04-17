const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
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
  plugins: [].concat(htmlPlugins),
};
