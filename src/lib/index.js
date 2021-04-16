const handlebars = require("handlebars");
const fs = require("fs-extra");
const path = require("path");

// resolve paths
const resolveOutputPath = (filename, rootPath) =>
  path.resolve(rootPath, `./public/${filename}.html`);

const resolveLayoutPath = (options, page, rootPath) => {
  const defaultFolder = options.path;
  const layoutTemplates = options.templates;
  // return default layout if page does not have layout option or the layout is not present in layout templates
  // TODO: convert this to be a file check which is more accurate
  if (!page["layout"] || !layoutTemplates[page["layout"]]) {
    return path.resolve(rootPath, `${defaultFolder}/index.hbs`);
  }

  return path.resolve(
    rootPath,
    `${defaultFolder}/${layoutTemplates[page["layout"]]}.hbs`
  );
};

const resolveTemplatePath = (templatePath, rootPath) => {
  // TODO check if index file exits or not
  return path.resolve(rootPath, `${templatePath}/index.hbs`);
};

const resolveDataPath = (templatePath, rootPath) => {
  // TODO check if index file exits or not
  return path.resolve(rootPath, `${templatePath}/index.json`);
};

const renderHbsTemplate = (template, data) => {
  const templateHbs = handlebars.compile(template);
  return templateHbs(data);
};

const linkStylesheet = (options) => {
  const defaultCSS = options.default;
  if (defaultCSS.type === "url") {
    return `<link rel="stylesheet" href="${defaultCSS.path}">`;
  }
  // TODO: If the type is path then copy the css to assets folder
};

/**
 * iterate over pages to render html to public folder
 * @param {Object} pages object containing the pages config
 * @param {Object} defaults object containing defaults
 * @param {Object} rootPath root path of the project
 * @returns Promise array of the outputfile renders
 */
const compilePageTemplates = (pages, defaults, rootPath) => {
  let outputFilePromises = [];
  for (const key in pages) {
    if (Object.hasOwnProperty.call(pages, key)) {
      // resolve the paths and get the file data
      const layoutPath = resolveLayoutPath(
        defaults.layoutOptions,
        pages[key],
        rootPath
      );
      const templatePath = resolveTemplatePath(pages[key].path, rootPath);
      const dataPath = resolveDataPath(pages[key].path, rootPath);

      if (!layoutPath || !templatePath || !dataPath) {
        //  If any of the paths are not available skip the render of the page
        continue;
      }

      outputFilePromises.push(
        Promise.all([
          fs.readFile(layoutPath, "utf8"),
          fs.readFile(templatePath, "utf8"),
          fs.readFile(dataPath, "utf8"),
        ]).then((values) => {
          let html = renderHbsTemplate(values[0], {
            body: renderHbsTemplate(values[1], JSON.parse(values[2])),
            stylesheet: linkStylesheet(defaults.cssOptions),
            title: key,
          });
          return fs.outputFile(resolveOutputPath(key, rootPath), html);
        })
      );
    }
  }

  return outputFilePromises;
};

module.exports = compilePageTemplates;
