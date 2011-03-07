var Glue = (function () {

    function Context() {
        this.ns = function () {};
        this.lang = null;
        this._all = [];
        this._linked = {};
    }
    Context.prototype = {

        add: function (data) {
            if (data.linked) {
                for (uri in data.linked) {
                    var glueNode = new GlueNode(data.linked[k]);
                    this._linked[uri] = glueNode;
                    this._all.push(glueNode);
                }
            }
            var nodes = data.resources || data.nodes;
            if (nodes) {
                nodes.forEach(function (node) {
                    var glueNode = new GlueNode(node);
                    this._linked[node.$uri] = glueNode;
                    this._all.push(glueNode);
                });
            }
            this._all.forEach(function (glueNode) {
                glueNode._deref(this);
            });
        },

        find: function (uri) {
            return this._linked[uri];
        },

        locale: function (lang) {
            this.lang = lang;
        }

    };

    function GlueNode(node) {
        this.l = node.$uri;
        this.r = Reverse(this);
    };
    GlueNode.prototype = {

        _deref: function (context) {
            for (key in this) {
                var ref = this[key].$ref;
                if (ref) {
                    var referenced = context._linked[ref];
                    if (!referenced) {
                        referenced = {l: ref};
                        referenced.r = Reverse(referenced);
                    }
                    referenced.r._add(key, this);
                    this[key] = referenced;
                }
            }
        },

        /** Creates a non-cyclic Gluon object containing all properties and
         * objects of the current object. For all objects that are refererences
         * (non-literals), each unnamed or singularly referenced bnode will be
         * contained, and also any reference being an URI with a fragment
         * sharing the same path before the frament. No incoming relations will be
         * included unless specified.
         */
        gluonize: function (/*optional*/ skelWrapper, /*optional*/ incoming) {
        }

    };

    function Reverse() {
    }
    Reverse.prototype = {
        _add: function (viaRel, node) {
            var rels = this[viaRel];
            if (rels === undefined) {
                this[viaRel] = rels = [];
            }
            if (rels.length === 1) {
                rels.f = rels[0];
            }
            rels.all.push(node);
        }
    }


    function LangNode(values) {
        this.f = values[0];
        this.all = values;
    }

    function LangMap(context) {
        this._context = context;
        this.lang = {};
    }
    LangMap.prototype = {
        f: function () {
            return this.lang[this.context.lang].f;
        },
        all: function () {
            return this.lang[this.context.lang].all;
        }
    };


    return {
        GlueContext: GlueContext
    };
})();
