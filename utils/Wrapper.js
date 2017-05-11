"use strict";
let _ = require('lodash');

let roles = {
    CONTAINER: "container",
    CONTAINERFLUID: "container-fluid",
    ROW: "row",
    COLUMN: "column"
};

class Wrapper {
    constructor(options) {
        this.opts = {
            components: [],
            role: roles.CONTAINER,
            attributes: {},
            gridSize: 12 //only available for role = column
        };
        this.children = "";
        _.assignIn(this.opts, options || {});
    }
    init() {
        this._getChildren();
        return this._render();
    }
    _getChildren() {
        let childrenArray = [];
        this.opts.components.forEach(component => childrenArray.push(component.init()));
        this.children = childrenArray.join("");
    }
    _render() {
        let attributes = this._parseAttributes();
        let classes = this._parseClasses();
        return `<div ${attributes} ${classes}>${this.children}</div>`;
    }
    _parseAttributes() {
        let keys = Object.keys(this.opts.attributes);
        _.remove(keys, key => key === 'class');
        let attributes = [];
        keys.forEach(key => attributes.push(`${key}="${this.opts.attributes[key]}"`));
        return attributes.join(" ");
    }
    _parseClasses() {
        let cls;
        switch (this.opts.role) {
            case roles.CONTAINER:
                cls = roles.CONTAINER;
                break;
            case roles.CONTAINERFLUID:
                cls = roles.CONTAINERFLUID;
                break;
            case roles.COLUMN:
                cls = `col-md-${this.opts.gridSize}`;
                break;
            default:
                cls = roles.ROW;
        }
        if ('class' in this.opts.attributes) {
            cls += ` ${this.opts.attributes.class}`;
        }
        return `class="${cls}"`;
    }
};
Wrapper.roles = roles;
module.exports = Wrapper;