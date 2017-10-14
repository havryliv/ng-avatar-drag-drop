import { Directive, ElementRef, HostListener, Input, Output, EventEmitter, OnInit, HostBinding, Renderer, NgZone, OnDestroy } from '@angular/core';
import { NgAvatarDragDropService } from '../services/ng-avatar-drag-drop.service';
import { DomHelper } from '../helpers/dom.helper';

@Directive({
    selector: '[draggable]'
})
/**
 * Makes an element draggable by adding the draggable html attribute
 */
export class Draggable implements OnInit, OnDestroy {
    /**
     * The selector that defines the drag Handle.
     * If defined drag will only be allowed if dragged from the selector element.
     */
    @Input() dragHandle: string;

    /**
     * The CSS class applied to a draggable element. If a dragHandle is defined then its applied to that handle
     * element only. By default it is used to change the mouse over pointer.
     */
    @Input() dragHandleClass = 'drag-handle';

    /**
     * @private
     * Keeps track of mouse over element that is used to determine drag handles
     */
    mouseDownElement: any;

    /**
     * @private
     * Function for unbinding the drag listener
     */
    unbindDragListener: Function;

    constructor(protected el: ElementRef, private renderer: Renderer,
                private ngAvatarDragDropService: NgAvatarDragDropService, private zone: NgZone) {
    }

    ngOnInit() {
        this.applyDragHandleClass();
    }

    ngOnDestroy() {
        this.unbindDragListeners();
    }

    @HostListener('onmousedown', ['$event'])
    onMouseDown(e) {
        console.log('onMouseDown', e);
    }

    @HostListener('onmouseup', ['$event'])
    onMouseUp(e) {
        console.log('onMouseUp', e);
    }

    @HostListener('onmousemove', ['$event'])
    onMouseMove(e) {
        console.log('onMouseMove', e);
    }

    @HostListener('ondragstart', ['$event'])
    onDragStart(e) {
        console.log('onDragStart', e);
    }

    private applyDragHandleClass() {
        let dragElement = this.getDragHandleElement();
        if (this.dragEnabled) {
            DomHelper.addClass(dragElement, this.dragHandleClass);
        } else {
            DomHelper.removeClass(this.el, this.dragHandleClass);
        }
    }

    private getDragHandleElement() {
        let dragElement = this.el;
        if (this.dragHandle) {
            dragElement = this.el.nativeElement.querySelector(this.dragHandle);
        }

        return dragElement;
    }

    unbindDragListeners() {
        if (this.unbindDragListener) {
            this.unbindDragListener();
        }
    }
}