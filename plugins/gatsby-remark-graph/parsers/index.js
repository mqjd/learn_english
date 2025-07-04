import drawioParser from "./drawio/index.js";
import krokiParser from "./kroki/index.js";

const parsers = {
  drawio: drawioParser,
  default: krokiParser,
};

const parser = async (param) => {
  const { nodeOptions, reporter } = param;
  // reporter.info(`generate ${nodeOptions.lang} img start`);
  const result = await (parsers[nodeOptions.lang] || parsers.default)(param);
  // reporter.info(`generate ${nodeOptions.lang} img end`);
  return result;
};

export default parser;
