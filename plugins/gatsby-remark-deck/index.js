import { visit } from "unist-util-visit";

const createSlideNode = () => {
  return {
    type: "mdxJsxFlowElement",
    children: [],
  };
};

const createDeckPageNode = (slides, position, theme) => {
  return {
    type: "mdxJsxFlowElement",
    name: "DeckPage",
    children: slides,
    position,
    attributes: [
      {
        type: "mdxJsxExpressionAttribute",
        value: "...props",
        data: {
          estree: {
            type: "Program",
            body: [
              {
                type: "ExpressionStatement",
                expression: {
                  type: "ObjectExpression",
                  properties: [
                    {
                      type: "SpreadElement",
                      argument: { type: "Identifier", name: "props" },
                    },
                  ],
                },
              },
            ],
            sourceType: "module",
          },
        },
      },
      theme && {
        type: "mdxJsxAttribute",
        name: "theme",
        value: {
          type: "mdxJsxAttributeValueExpression",
          value: "theme",
          data: {
            estree: {
              type: "Program",
              body: [
                {
                  type: "ExpressionStatement",
                  expression: {
                    type: "Identifier",
                    name: "theme",
                  },
                },
              ],
              sourceType: "module",
            },
          },
        },
      },
    ].filter(Boolean),
  };
};

const containsTheme = (children) => {
  return (
    children
      .filter((v) => v.type === "mdxjsEsm")
      .filter((v) => /^(\s+)?export\s+const\s+theme(\s)+=/.test(v.value)).length > 0
  );
};

const plugin = ({ markdownNode, markdownAST }) => {
  const deck = markdownNode.frontmatter.deck || false;
  if (deck) {
    visit(markdownAST, "root", (node) => {
      const { children } = node;
      const nodes = children.reduce(
        (result, item) => {
          if (item.type === "mdxjsEsm") {
            result.scripts.push(item);
          } else {
            result.elements.push(item);
          }
          return result;
        },
        { scripts: [], elements: [] }
      );

      const position = {
        start: nodes.elements[0].position.start,
        end: nodes.elements[nodes.elements.length - 1].position.end,
      };
      const slides = [];
      let slide = createSlideNode();
      nodes.elements.forEach((item) => {
        if (item.type === "thematicBreak") {
          slides.push(slide);
          slide = createSlideNode();
        } else {
          slide.children.push(item);
        }
      });
      slides.push(slide);
      node.children.splice(
        0,
        node.children.length,
        ...nodes.scripts,
        createDeckPageNode(slides, position, containsTheme(children))
      );
    });
  }
};

export default plugin;
