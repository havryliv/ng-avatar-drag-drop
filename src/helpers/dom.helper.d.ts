import { ElementRef } from '@angular/core';
export declare class DomHelper {
    /**
     * Polyfill for element.matches()
     * See: https://developer.mozilla.org/en/docs/Web/API/Element/matches#Polyfill
     * @param element
     * @param selectorName
     */
    static matches(element: any, selectorName: string): boolean;
    /**
     * Applies the specified css class on nativeElement
     * @param elementRef
     * @param className
     */
    static addClass(elementRef: ElementRef | any, className: string): void;
    /**
     * Removes the specified class from nativeElement
     * @param elementRef
     * @param className
     */
    static removeClass(elementRef: ElementRef | any, className: string): void;
    /**
     * Gets element with valid classList
     *
     * @param elementRef
     * @returns ElementRef | null
     */
    private static getElementWithValidClassList(elementRef);
}
