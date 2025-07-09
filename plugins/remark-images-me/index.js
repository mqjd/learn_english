import { visit } from 'unist-util-visit';

/**
 * MDX remark plugin to add `maxWidth` style to images
 * @param {object} options - Plugin options
 * @param {number} options.maxWidth - Maximum width in pixels (default: 300)
 */
export default function remarkMdxImageStyle(options = {}) {
  const maxWidth = options.maxWidth || 300;

  return (tree) => {
    visit(tree, 'image', (node) => {
      if (!node.data) node.data = {};
      if (!node.data.hProperties) node.data.hProperties = {};

      // Add or merge existing style
      const currentStyle = node.data.hProperties.style || '';
      node.data.hProperties.style =
        `${currentStyle} max-width: ${maxWidth}px;`.trim();

      // Optional: Ensure alt text exists
      node.data.hProperties.alt = node.alt || '';
    });
  };
}
