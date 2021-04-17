const path = require("path");

const config = require("./src/config/site.config.json");
const compilePageTemplates = require("./src/lib");

// env
const ENV = process.env.ENV;

// get all pages
const pages = config.pages;
const defaults = config.defaults;
const rootPath = path.resolve(__dirname);

// TODO: split serve and template build
// template build, SCSS and JS build, push the build to public or copy assets to public

Promise.all(compilePageTemplates(pages, defaults, rootPath)).then((values) => {
  console.log("File written successfully\n");
});

// TODO site map page in default view
