"use strict";
let should = require('should');
let Wrapper = require('../utils/Wrapper');

class FakeComponent {
    constructor(name) {
        this.name = name;
    }
    init() {
        return `<span>${this.name} </span>`;
    }
}

describe("Wrapper should work normally as container", () => {
    it("should work as expect without parameters", () => {
        Wrapper.should.have.keys("roles");
        Wrapper.roles.should.have.keys("CONTAINER", "CONTAINERFLUID", "ROW", "COLUMN");
        let isOK = true,
            wrapper;
        try {
            wrapper = new Wrapper();
            let str = wrapper.init();
            console.log(str);
            isOK = /(<|<\/)div/.test(str) && /class="container"/.test(str);
        } catch (e) {
            console.error(e);
            isOK = false;
        }
        isOK.should.be.true();
    });
    it("should work as expect with parameters", () => {
        let options = {
            role: Wrapper.roles.CONTAINER,
            attributes: {
                id: "testContainer",
                title: "Test container.",
                class: "someOtherClasses"
            }
        };
        let isOK = true,
            wrapper;
        try {
            wrapper = new Wrapper(options);
            let str = wrapper.init();
            console.log(str);
            isOK = /(<|<\/)div/.test(str) &&
                /id="testContainer"/.test(str) &&
                /title="Test\ container."/.test(str) &&
                /class="container someOtherClasses"/.test(str);
        } catch (e) {
            console.error(e);
            isOK = false;
        }
        isOK.should.be.true();
        options.role = Wrapper.roles.CONTAINERFLUID;
        try {
            wrapper = new Wrapper(options);
            let str = wrapper.init();
            console.log(str);
            isOK = /class="container-fluid someOtherClasses"/.test(str);
        } catch (e) {
            console.error(e);
            isOK = false;
        }
        isOK.should.be.true();
    });
    it("should work as expect with components", () => {
        let fkNumber1 = new FakeComponent("Good"),
            fkNumber2 = new FakeComponent("Morning"),
            fkNumber3 = new FakeComponent("Buddy!");
        let options = {
            components: [fkNumber1, fkNumber2, fkNumber3],
            role: Wrapper.roles.CONTAINER,
            attributes: {
                id: "testContainer",
                title: "Test container.",
                class: "someOtherClasses"
            }
        };
        let isOK = true,
            wrapper;
        try {
            wrapper = new Wrapper(options);
            let str = wrapper.init();
            console.log(str);
            isOK = /(<|<\/)div/.test(str) &&
                /id="testContainer"/.test(str) &&
                /title="Test\ container."/.test(str) &&
                /class="container someOtherClasses"/.test(str);
        } catch (e) {
            console.error(e);
            isOK = false;
        }
        isOK.should.be.true();
    });
});
describe("Wrapper should work normally as row", () => {
    it("should work as expect with role=row", () => {
        let options = {
            role: Wrapper.roles.ROW,
            attributes: {
                id: "testRow",
                title: "Test row.",
                class: "someOtherClasses"
            }
        };
        let isOK = true,
            wrapper;
        try {
            wrapper = new Wrapper(options);
            let str = wrapper.init();
            console.log(str);
            isOK = /(<|<\/)div/.test(str) &&
                /id="testRow"/.test(str) &&
                /title="Test\ row."/.test(str) &&
                /class="row someOtherClasses"/.test(str);
        } catch (e) {
            console.error(e);
            isOK = false;
        }
        isOK.should.be.true();
    });
    it("should work as expect with components", () => {
        let fkNumber1 = new FakeComponent("Good"),
            fkNumber2 = new FakeComponent("Morning"),
            fkNumber3 = new FakeComponent("Buddy!");
        let options = {
            components: [fkNumber1, fkNumber2, fkNumber3],
            role: Wrapper.roles.ROW,
            attributes: {
                id: "testRow",
                title: "Test row.",
                class: "someOtherClasses"
            }
        };
        let isOK = true,
            wrapper;
        try {
            wrapper = new Wrapper(options);
            let str = wrapper.init();
            console.log(str);
            isOK = /(<|<\/)div/.test(str) &&
                /id="testRow"/.test(str) &&
                /title="Test\ row."/.test(str) &&
                /class="row someOtherClasses"/.test(str);
            isOK = isOK && /\>Good\ |\>Morning\ |\>Buddy/.test(str);
        } catch (e) {
            console.error(e);
            isOK = false;
        }
        isOK.should.be.true();
    });
});
describe("Wrapper should work normally as column", () => {
    it("should work as expect with role=column", () => {
        let options = {
            role: Wrapper.roles.COLUMN,
            attributes: {
                id: "testColumn",
                title: "Test column.",
                class: "someOtherClasses"
            }
        };
        let isOK = true,
            wrapper;
        try {
            wrapper = new Wrapper(options);
            let str = wrapper.init();
            console.log(str);
            isOK = /(<|<\/)div/.test(str) &&
                /id="testColumn"/.test(str) &&
                /title="Test\ column."/.test(str) &&
                /class="col-md-12 someOtherClasses"/.test(str);
        } catch (e) {
            console.error(e);
            isOK = false;
        }
        isOK.should.be.true();
        options.gridSize = 6;
        try {
            wrapper = new Wrapper(options);
            let str = wrapper.init();
            console.log(str);
            isOK = /col-md-6/.test(str);
        } catch (e) {
            console.error(e);
            isOK = false;
        }
        isOK.should.be.true();
    });
});