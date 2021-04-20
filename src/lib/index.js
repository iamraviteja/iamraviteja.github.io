const handlebars = require("handlebars");
const fs = require("fs-extra");
const path = require("path");
const promisify = require("util").promisify;

// resolve paths
const resolveOutputPath = (filename, rootPath) =>
  path.resolve(rootPath, `./src/templates/${filename}.html`);

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
  let returnlinks = ``;

  // loop over the options and concat the url to links
  for (const key in options) {
    if (Object.hasOwnProperty.call(options, key)) {
      const cssOption = options[key];
      if (cssOption.type === "url") {
        returnlinks += `<link rel="stylesheet" href="${cssOption.path}" >\n`;
      }
    }
  }
  return returnlinks;
};

const registerPartials = (partialsPath, rootPath) => {
  // loop over first level folders and convert the index.hbs files to partials
  let partialFolders = [];
  console.log("running ...");
  return promisify(fs.readdir)(partialsPath)
    .then((folders) => {
      partialFolders = folders;
      return Promise.all(
        folders.map((folderPath) => {
          return fs.readFile(
            path.resolve(rootPath, `${partialsPath}/${folderPath}/index.hbs`),
            "utf8"
          );
        })
      );
    })
    .then((data) => {
      partialFolders.map((folder, index) => {
        handlebars.registerPartial(folder, data[index]);
      });
      return true;
    })
    .catch((err) => console.error(err));
};

/**
 * iterate over pages to render html to public folder
 * @param {Object} pages object containing the pages config
 * @param {Object} defaults object containing defaults
 * @param {Object} rootPath root path of the project
 * @returns Promise array of the outputfile renders
 */
const compilePageTemplates = async (pages, defaults, rootPath) => {
  let outputFilePromises = [];
  const partialsPath = path.resolve(rootPath, defaults.partials.path);

  // Register partials and helpers
  let isPartial = await registerPartials(partialsPath, rootPath);

  if (isPartial) {
    console.log(`Partials registration complete`);
  }

  // TODO: throw error and abort compilation if partials are not registered

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

  return Promise.all(outputFilePromises);
};

module.exports = compilePageTemplates;
