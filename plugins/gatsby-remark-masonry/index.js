import { visit } from 'unist-util-visit'

const extractTableParams = ({ type, value }) => {
  if (type !== 'mdxFlowExpression') {
    return null
  }

  const regex = /\/\*\s*([^:]+:\s*[^;]+;\s*)*([^:]+:\s*[^;]+)\s*\*\//
  const commentMatch = value.match(regex)
  if (!commentMatch) return null

  const pairs = commentMatch[0]
    .replace(/\/\*|\*\//g, '')
    .trim()
    .split(';')
  const styles = {}
  pairs.forEach((pair) => {
    const [key, value] = pair.split(':').map((s) => s.trim())
    if (key && value) {
      styles[key] = value
    }
  })
  return styles
}

const plugin = ({ markdownNode, markdownAST }) => {
  visit(markdownAST, 'root', (node) => {
    const { children } = node
    let index = 0
    let hasMasonry = false
    let itemCount = 0
    let globalUseStudyMode = false
    do {
      const item = children[index]
      const param = extractTableParams(item)
      const useStudyMode = param.useStudyMode !== 'false'
      globalUseStudyMode = globalUseStudyMode || useStudyMode
      if (param) {
        children.splice(index, 1)
        const tableNode = children[index]
        if (param['table-style'] === 'masonry' && tableNode.type === 'table') {
          const rows = tableNode.children.slice(1)
          const masonryItems = rows.map((row) => {
            const [titleCell, contentCell] = row.children
            const title = titleCell.children[0].value
            return {
              type: 'mdxJsxFlowElement',
              name: 'MasonryItem',
              attributes: [{ type: 'mdxJsxAttribute', name: 'title', value: title }],
              position: row.position,
              children: contentCell.children
            }
          })
          const masonryNode = {
            type: 'mdxJsxFlowElement',
            name: 'Masonry',
            children: masonryItems,
            position: tableNode.position,
            attributes: [
              {
                type: 'mdxJsxAttribute',
                name: 'itemCount',
                value: masonryItems.length
              },
              { type: 'mdxJsxAttribute', name: 'useStudyMode', value: useStudyMode }
            ]
          }
          itemCount += masonryItems.length
          children.splice(index, 1, masonryNode)
          hasMasonry = true
        }
      }
      index++
    } while (index < children.length)
    if (hasMasonry) {
      const globalMasonryNode = {
        type: 'mdxJsxFlowElement',
        name: 'GlobalMasonry',
        children: children,
        position: children[0].position,
        attributes: [
          { type: 'mdxJsxAttribute', name: 'itemCount', value: itemCount },
          { type: 'mdxJsxAttribute', name: 'useStudyMode', value: globalUseStudyMode }
        ]
      }
      markdownAST.children = [globalMasonryNode]
    }
  })
}

export default plugin
