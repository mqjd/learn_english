import { visit } from "unist-util-visit";
const transformer = (ast) => {
  console.log(1);
};

const plugin = () => transformer;
export default plugin;
