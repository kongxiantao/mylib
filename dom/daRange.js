/**
 * daRange.js: Handle native text ranges
 *
 * Copyright (c) 2011, John Acosta - @John_Acosta <wwww.jseros.com>
 * All rights reserved.
 * License: http://www.opensource.org/licenses/BSD-2-Clause
 */
function daRange() {
	var range = null;
	var self = this;
	var mode = {
		ie : ('createTextRange' in document.body),
		w3c : ('createRange' in document)
	};
	
	this.seekNode = function (node, parentNode) {
		if (parentNode && parentNode.nodeType === 1) {
			for (var i = 0, l = parentNode.childNodes.length; i < l; i++) {
				if (parentNode.childNodes[i].nodeType === 3) {
					if (parentNode.childNodes[i] === node) {
						return this.seekNode.$pos;
					} else {
						this.seekNode.$pos += stripNL(parentNode.childNodes[i].nodeValue).length;
					}
				} else if (parentNode.childNodes[i].nodeType === 1 && parentNode.childNodes[i].childNodes.length) {
					this.seekNode(node, parentNode.childNodes[i]);
				}
			}
		}
	};
	
	this.seekNode.clear = function () {
		self.seekNode.$pos = 0;
	};
	
	this.toString = (function () {
			return mode.w3c ? function () {
				return range.toString();
			}
			 : function () {
				return range.text;
			};
		})();
	
	this.setBoundary = (function () {
			return mode.w3c ?
			function (ini, end) {
				range.setStart(ini.node, ini.pos);
				range.setEnd(end.node, end.pos);
			}
			 :
			function (ini, end, ed) {
				var r2 = document.body.createTextRange();
				var r3 = document.body.createTextRange();
				
				if (ini.node.nodeType === 3) {
					this.seekNode.clear();
					ini.pos += this.seekNode(ini.node, ini.node.parentNode);
					ini.node = ini.node.parentNode;
				}
				
				if (end.node.nodeType === 3) {
					this.seekNode.clear();
					end.pos += this.seekNode(end.node, end.node.parentNode);
					end.node = end.node.parentNode;
				}
				
				r3.moveToElementText(ini.node);
				r3.collapse();
				r3.moveEnd('character', ini.pos);
				
				var match = r3.text.match(/[\n]/g);
				var nl = match ? match.length : 0;
				
				range.moveToElementText(ini.node);
				range.moveStart('character', ini.pos + nl);
				r2.moveToElementText(end.node);
				r2.moveStart('character', ini.pos + nl);
				range.setEndPoint('EndToStart', r2);
				range.moveEnd('character', ((end.pos - ini.pos)));
			};
		})();
	
	this.surroundContents = (function (node) {
			return mode.w3c ?
			function (node) {
				range.surroundContents(node);
			}
			 :
			function (node) {
				node.appendChild(document.createTextNode(range.text));
				range.text = '';
			};
		})();
	
	this.insertNode = (function () {
			return mode.w3c ?
			function (node) {
				range.insertNode(node);
				return node;
			}
			 :
			function (node) {
				var nodeId = '';
				
				do {
					nodeId = 'rngnode-' + (Math.random() * 999);
				} while (document.getElementById(nodeId));
				
				node.setAttribute('id', nodeId);
				
				var tmp = document.createElement('div');
				tmp.appendChild(node);
				
				range.pasteHTML(tmp.innerHTML);
				tmp.removeNode();
				
				return document.getElementById(nodeId);
			};
		})();
	
	this.detach = function () {
		if (mode.w3c) {
			range.detach();
		} else {
			//IE doesn't implement a way to release the range. IE Sux
			range = null;
		}
	};
	
	this.select = function () {
		if (mode.ie) {
			range.select();
		}
	};
	
	this.moveToElementText = function (node) {
		if (mode.ie) {
			range.moveToElementText(node);
		}
	};
	
	function stripNL(s) {
		return s.replace(/[\n\r\t]/g, '');
	}
	
	range = mode.w3c ? document.createRange() : document.body.createTextRange();
}
 