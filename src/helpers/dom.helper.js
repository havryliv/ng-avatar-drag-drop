"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var DomHelper = /** @class */ (function () {
    function DomHelper() {
    }
    /**
     * Polyfill for element.matches()
     * See: https://developer.mozilla.org/en/docs/Web/API/Element/matches#Polyfill
     * @param element
     * @param selectorName
     */
    DomHelper.matches = function (element, selectorName) {
        var proto = Element.prototype;
        var func = proto['matches'] ||
            proto.matchesSelector ||
            proto.mozMatchesSelector ||
            proto.msMatchesSelector ||
            proto.oMatchesSelector ||
            proto.webkitMatchesSelector ||
            function (s) {
                var matches = (this.document || this.ownerDocument).querySelectorAll(s), i = matches.length;
                while (--i >= 0 && matches.item(i) !== this) {
                }
                return i > -1;
            };
        return func.call(element, selectorName);
    };
    /**
     * Applies the specified css class on nativeElement
     * @param elementRef
     * @param className
     */
    DomHelper.addClass = function (elementRef, className) {
        var e = this.getElementWithValidClassList(elementRef);
        if (e) {
            e.classList.add(className);
        }
    };
    /**
     * Removes the specified class from nativeElement
     * @param elementRef
     * @param className
     */
    DomHelper.removeClass = function (elementRef, className) {
        var e = this.getElementWithValidClassList(elementRef);
        if (e) {
            e.classList.remove(className);
        }
    };
    /**
     * Gets element with valid classList
     *
     * @param elementRef
     * @returns ElementRef | null
     */
    DomHelper.getElementWithValidClassList = function (elementRef) {
        var e = elementRef instanceof core_1.ElementRef ? elementRef.nativeElement : elementRef;
        if (e.classList !== undefined && e.classList !== null) {
            return e;
        }
        return null;
    };
    return DomHelper;
}());
exports.DomHelper = DomHelper;
//# sourceMappingURL=dom.helper.js.map