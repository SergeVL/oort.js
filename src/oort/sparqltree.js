/**
 * Oort : SparqlTree
 *
 * Turns SPARQL results into JS object trees.
 */


//Module = Module || function (init) { init(this); };
//Oort = Oort || {};
//Oort.SparqlTree = new Module(function (self) {
//});


var SparqlTree = {

  SEP: '__',
  ONE_MARKER: '1_',

  uriKey: '_uri',
  bnodeKey: '_bnode',
  datatypeKey: '_datatype',
  valueKey: '_value',
  langTag: '@',
  skipNull: true,

  /**
   * Create an object tree from a SPARQL JSON result.
   */
  buildTree: function (data, root) {
    var varModel = this.makeVarTreeModel(data.head.vars);
    var root = root || {};
    this.fillNodes(varModel, root, data.results.bindings);
    return root;
  },

  makeVarTreeModel: function (vars) {
    vars.sort();
    var varTree = {};
    for (var i=0; i < vars.length; i++) {
      var varName = vars[i];
      if (startsWith(varName, "_"))
        continue;
      var currTree = varTree;
      var keys = varName.split(this.SEP);
      for (var j=0; j < keys.length; j++) {
        var key = keys[j];
        var useOne = false;
        if (startsWith(key, this.ONE_MARKER)) {
          useOne = true;
          key = key.substring(2, key.length);
        }
        if (currTree[key] !== undefined) {
          currTree = currTree[key].subVarModel;
        } else {
          var subTree = {};
          var modelNode = {useOne: useOne, varName: varName, subVarModel: subTree};
          currTree[key] = modelNode;
          currTree = subTree;
        }
      }
    }
    return varTree;
  },

  fillNodes: function (varModel, parentNode, bindings) {
    for (var key in varModel) {
      var m = varModel[key];
      var nodes = [];
      var grouped = this.groupBy(bindings, m.varName);
      for (bindingKey in grouped) {
        if (!bindingKey) {
            continue;
        }
        var group = grouped[bindingKey];
        var node = this.makeNode(group.keyBinding);
        nodes.push(node);
        if (node instanceof Object && hasKeys(m.subVarModel)) {
          this.fillNodes(m.subVarModel, node, group.groupedBindings);
        }
      }
      var finalValue = nodes;
      if (m.useOne) {
        finalValue = this.completeNode(this.toOne(nodes), key, parentNode);
      } else {
        for (var i=0; i < nodes.length; i++) {
          nodes[i] = this.completeNode(nodes[i], key, parentNode);
        }
      }
      if (this.skipNull && finalValue === null)
        continue;
      parentNode[key] = finalValue;
    }
  },

  groupBy: function (items, varName) {
    var grouped = {};
    for (var i=0, l=items, ln=l.length; i < ln; i++) {
      var it = l[i];
      var keyBinding = it[varName];
      if (keyBinding === undefined)
        continue;
      var key = keyBinding.value;
      if (grouped[key]) {
        grouped[key].groupedBindings.push(it);
      } else {
        grouped[key] = {keyBinding: keyBinding, groupedBindings: [it]};
      }
    }
    return grouped;
  },

  makeNode: function (binding) {
    var node = {};
    var value = binding.value;
    if (binding.type === 'uri') {
      node[this.uriKey] = value;
    } else if (binding.type === 'bnode') {
      node[this.bnodeKey] = value;
    } else if (binding.type === 'literal') {
      var lang = binding['xml:lang'];
      if (lang != null)
          node[this.langTag + lang] = value;
      else
          node = value;
    } else if (binding.type === 'typed-literal') {
      node = this.typeCast(binding.datatype, value);
    } else {
      throw "TypeError: unknown value type for: " + repr(binding);
    }
    return node;
  },

  typeCast: function (datatype, value) {
    if (datatype === XSD+'boolean') {
      return value == "true"? true : false;
    } else if (numberTypes[datatype]) {
      return new Number(value);
    } else {
      var node = {};
      node[this.valueKey] = value;
      node[this.datatypeKey] = datatype;
      return node;
    }
  },

  toOne: function (nodes) {
    if (nodes.length === 0) {
      return null;
    }
    var first = nodes[0]
    if (this.isLangMap(first)) {
      first = {}
      for (var i=0, l=nodes, ln=l.length; i < ln; i++) {
        var node = l[i];
        if (!(node instanceof Object)) {
          node = {};
          node[this.langTag] = node;
        }
        if (node.length === 0) {
          continue;
        }
        for (key in node) {
          first[key] = node[key];
          break;
        }
      }
    }
    return first;
  },

  isLangMap: function (obj) {
    if (obj instanceof Object)
      for (key in obj)
        if (startsWith(key, this.langTag))
          return true;
    return false;
  },


  /**
    * Override this no customize the final value of a processed node.
    * Default is to return the node itself;
    */
  completeNode: function (node, key, parentNode) {
    return node;
  },


  // helpers for result data values

  isLangNode: function (obj) {
    if (obj instanceof Object)
      for (key in obj)
        return startsWith(key, this.langTag);
      return false;
  },

  isDatatypeNode: function (obj) {
    var datatype = obj[this.datatypeKey];
    return datatype !== undefined && datatype !== null;
  },

  isLiteral: function (obj) {
    return (obj instanceof String) || isDatatypeNode(obj) || isLangNode(obj);
  },

  isResource: function (obj) {
    return ! isLiteral(obj);
  }

};


var XSD = "http://www.w3.org/2001/XMLSchema#";

var numberTypes = {};
(function () {
  function addNumberType(name) {
      numberTypes[XSD + name] = true;
  }
  addNumberType('decimal');
  addNumberType('double');
  addNumberType('float');
  addNumberType('int');
  addNumberType('integer');
  addNumberType('long');
  addNumberType('negativeInteger');
  addNumberType('nonNegativeInteger');
  addNumberType('nonPositiveInteger');
  addNumberType('positiveInteger');
  addNumberType('short');
  addNumberType('unsignedInt');
  addNumberType('unsignedLong');
  addNumberType('unsignedShort');
})();


function startsWith(str, startStr) {
  return str.substr(0, startStr.length) === startStr;
}

function hasKeys(o) {
  for (k in o) return true;
  return false;
}

function repr(o) {
  var s = "{";
  for (k in o) { s += k + ": " + o[k] + "; "; }
  return s + "}";
}

