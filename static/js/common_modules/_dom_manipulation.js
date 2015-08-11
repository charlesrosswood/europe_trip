var removeContents = function(node) {
  var nodesToDelete = [];
  // remove all the previous children nodes
  for (var i = 0; i < node.children.length; i++) {
    var childNode = node.children[i];
    if (!childNode.classList.contains('close-icon')) {
      nodesToDelete.push(childNode);
    }
  }

  for (var i = 0; i < nodesToDelete.length; i++) {
    var childNode = nodesToDelete[i];
    node.removeChild(childNode);
  }
}

var createNodeWithContent = function(nodeType, text) {
  const node = document.createElement(nodeType);

  if (text !== null) {
    const nodeText = document.createTextNode(text);
    node.appendChild(nodeText);
  }

  return node;
}

var createNodeWithText = function(nodeType, text, label) {
  // Create a container for the rendered form elements
  const containerNode = document.createElement('div');
  class_operations.addClass(containerNode, 'form-element-container');

  // If there's no label, don't render one
  if (label) {
    const labelNode = document.createElement('div');
    class_operations.addClass(labelNode, 'label');
    const labelText = document.createTextNode(label);
    labelNode.appendChild(labelText);

    containerNode.appendChild(labelNode);
  }

  const node = createNodeWithContent(nodeType, text);
  class_operations.addClass(node, 'form-value');

  // Special for 'general comment' search box node
  if (nodeType === 'input') {
    const generalCommentContainer = document.createElement('div');
    class_operations.addClass(generalCommentContainer, 'general-comment-container');

    generalCommentContainer.appendChild(node);
    containerNode.appendChild(generalCommentContainer);
  } else {
    containerNode.appendChild(node);
  }

  if (nodeType === 'select' || nodeType === 'input') {
    return {
      container: containerNode,
      innerNode: node
    };
  }
  return containerNode;
}

exports.removeContents = removeContents;
exports.createNodeWithContent = createNodeWithContent;
exports.createNodeWithText = createNodeWithText;