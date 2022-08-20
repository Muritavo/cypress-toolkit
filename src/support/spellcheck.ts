function getTextNodesIn(elem: HTMLElement): ChildNode[] {
    var textNodes: ChildNode[] = [];
    if (elem) {
        for (var nodes = elem.childNodes, i = nodes.length; i--;) {
            var node = nodes[i], nodeType = node.nodeType;
            if (nodeType == 3) {
                textNodes.push(node);
            }
            else if (nodeType == 1 || nodeType == 9 || nodeType == 11) {
                textNodes = textNodes.concat(getTextNodesIn(node as HTMLElement));
            }
        }
    }
    return textNodes;
}

Cypress.Commands.add("validateSpelling", (language) => {
    let nodeErrors: Error[] = [];

    // Get all text nodes
    const textNodes: Node[] = getTextNodesIn(document.body)
    for (let node of textNodes) {
        try {
            cy.execTask("validateText", {
                language,
                text: node.textContent!
            })
        } catch (e) {
            nodeErrors.push(e as Error)
        }
    }

    if (nodeErrors.length) {
        throw new Error(`There were errors validating the text (they were highlighted on the page):
${nodeErrors.map(e => e.message).join("\n")}
        `)
    }
})