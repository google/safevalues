/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Library that provides safe getters for different node properties and
 * checks for clobbering.
 */

/** Gets a reasonable nodeName, even for clobbered nodes. */
export function getNodeName(node: Node): string {
  const nodeName = node.nodeName;
  // If the property is clobbered, assume it is an `HTMLFormElement`.
  return (typeof nodeName === 'string') ? nodeName : 'FORM';
}

/** Returns true if the object passed is a Text node. */
export function isText(node: Node): node is Text {
  // The property cannot get clobbered on Text nodes.
  return node.nodeType === 3;  // Node.TEXT_NODE
}

/** Returns true if the object passed is an Element node. */
export function isElement(node: Node): node is Element {
  const nodeType = node.nodeType;
  // If the property is clobbered, we can assume it is an `HTMLFormElement`, and
  // thus an `Element`.
  return (nodeType === 1 /* Node.ELEMENT_NODE */) ||
      (typeof nodeType !== 'number');
}
