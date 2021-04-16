const path = require("path");

const config = require("./src/config/site.config.json");
const compilePageTemplates = require("./src/lib");

// env
const ENV = process.env.ENV;
const shouldServeLocal = process.env.SERVE.toLowerCase() === "true";

const express = require("express");
const app = express();
const port = 3000;

// get all pages
const pages = config.pages;
const defaults = config.defaults;
const rootPath = path.resolve(__dirname);

// copy the assets to public folder
// build the scss to public folder
// TODO: push this to build script like webpack or gulp or grunt

Promise.all(compilePageTemplates(pages, defaults, rootPath)).then((values) => {
  console.log("File written successfully\n");
  if (shouldServeLocal) {
    console.log("Start the server\n");
    app.use(express.static("public"));
    app.listen(port, () => {
      console.log(`Example app listening at http://localhost:${port}`);
    });
  }
});

// TODO site map page in default view
