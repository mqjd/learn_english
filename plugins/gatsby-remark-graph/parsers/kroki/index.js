import { post, toSingleNode, readFileIfExists } from "../../utils/index.js";
import pako from "pako";

const parser = async (param) => {
  const {
    content,
    pluginOptions: { basePath, remoteBasePath, krokiUrl },
    nodeOptions: { lang },
  } = param;
  const localPath = basePath + content;
  let fileContent = await readFileIfExists(localPath);
  if (fileContent === null) {
    if (content.indexOf("http") === 0) {
      fileContent = await get(content);
    } else if (/\n/.test(content)) {
      fileContent = content;
    } else {
      try {
        fileContent = await get(remoteBasePath + content);
      } catch {
        throw Error("invalid content " + content);
      }
    }
  }
  const result = await post({
    url: krokiUrl,
    headers: {
      "Content-Type": "text/plain",
    },
    body: JSON.stringify({
      diagram_source: fileContent,
      diagram_type: lang,
      output_format: "svg",
    }),
  });
  return toSingleNode(result);
};
export default parser;
