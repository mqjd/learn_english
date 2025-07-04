import { visit } from "unist-util-visit";
const prefix = "drawio";
const prefixLength = prefix.length + 1;

export default ({ markdownAST, reporter }, options) => {
  visit(markdownAST, "code", (node) => {
    try {
      let lang = (node.lang || "").toLowerCase().trim();
      if (lang.indexOf(prefix) === 0) {
        var url = node.value;
        if (url.indexOf("/") !== 0 && url.indexOf("http") !== 0) {
          url = options.baseUrl + url;
        }
        let param =
          lang.length <= prefixLength ? "" : lang.substr(prefixLength);
        node.type = "element";
        node.tagName = "DrawioViewer";
        node.properties = {
          ...options.viewer,
          param,
          url,
        };
      }
    } catch (e) {
      reporter.error(`plugin: drawio, error when parse ${node.value}`, e);
      node.type = `html`;
      node.value = `<span>${e}</span>`;
    }
  });
};
