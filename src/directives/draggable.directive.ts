import { Directive, ElementRef, HostListener, Input, Output, EventEmitter, OnInit, HostBinding, Renderer, NgZone, OnDestroy } from '@angular/core';
import { NgAvatarDragDropService } from '../services/ng-avatar-drag-drop.service';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/takeUntil';
import { DomHelper } from '../helpers/dom.helper';
import {Position} from "../classes/position.class";

@Directive({
    selector: '[draggable]'
})
/**
 * Makes an element draggable by adding the draggable html attribute
 */
export class Draggable implements OnInit, OnDestroy {
    public static DRAG_TYPE_POSITION = 0;
    public static DRAG_TYPE_TRANSFORM = 1;

    /**
     * The data that will be avaliable to the droppable directive on its `onDrop()` event.
     */
    @Input() dragData;

    /**
     * The selector that defines the drag Handle.
     * If defined drag will only be allowed if dragged from the selector element.
     */
    @Input() dragHandle: HTMLElement;

    /**
     * The selector that defines the drag Bounds.
     */
    @Input() dragBounds: HTMLElement;

    /**
     */
    @Input() dragEnabled: boolean;

    /**
     * The CSS class applied to a draggable element. If a dragHandle is defined then its applied to that handle
     * element only. By default it is used to change the mouse over pointer.
     */
    @Input() dragHandleClass = 'drag-handle';

    /**
     * The selector that defines the drag Type.
     * If defined drag will only be allowed if dragged from the selector element.
     */
    @Input() dragType: number = Draggable.DRAG_TYPE_POSITION;

    /**
     * Event fired while the element is being dragged
     */
    @Output() onDragEvent: EventEmitter<any> = new EventEmitter();

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

    mouseDragEvent;
    mouseUpEvent = new EventEmitter();
    mouseDownEvent = new EventEmitter();
    mouseMoveEvent = new EventEmitter();

    _originalZIndex: string = '';
    _originalPosition: string = '';
    _originalObject: Position = null;
    _originalPositionObject: Position = new Position(0, 0);
    _temporaryPositionObject: Position = new Position(0, 0);

    _isDragging: boolean = false;

    @Input()
    set draggable(dragEnabled: any) {
        if (dragEnabled !== undefined && dragEnabled !== null && dragEnabled !== '') {
            this.dragEnabled = !!dragEnabled;

            let element = this.dragHandle ? this.dragHandle : this.el.nativeElement;

            if (this.dragEnabled) {
                this.renderer.setElementClass(element, 'ng-avatar-drag-drop', true);
            }
            else {
                this.renderer.setElementClass(element, 'ng-avatar-drag-drop', false);
            }
        }
    }

    @HostListener('dragstart', ['$event'])
    onDragStart(event) {
        console.log('dragstart');
        event.preventDefault();

        this.catchupDrag(event);
        return false;
    }

    @HostListener('dragend', ['$event'])
    onDragEnd(event) {
        console.log('dragend');
        return false;
    }

    @HostListener('document:mouseup', ['$event'])
    onMouseUp(event: MouseEvent) {
        this.mouseUpEvent.emit(event);
        this.revertChanges(event);
    }

    @HostListener('document:mouseleave', ['$event'])
    onMouseLeave(event: MouseEvent) {
        this.revertChanges(event);
    }

    @HostListener('mousedown', ['$event'])
    onMouseDown(event: MouseEvent) {
        // 1. skip right click;
        // 2. if handle is set, the element can only be moved by handle
        if (event.button == 2 || (this.dragHandle !== undefined && event.target !== this.dragHandle)) {
            return;
        }

        this._originalObject = new Position(event.clientX, event.clientY);

        this.catchupDrag(event);

        return false; // Call preventDefault() on the event
    }

    @HostListener('document:mousemove', ['$event'])
    onMouseMove(event: MouseEvent) {
        this.mouseMoveEvent.emit(event);
    }

    @HostListener('touchstart', ['$event'])
    onTouchStart(event: any) {
        event.stopPropagation();
        event.preventDefault();

        if (this.dragHandle !== undefined && event.target !== this.dragHandle) {
            return;
        }

        this._originalObject = new Position(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
        this.catchupDrag(event);
    }

    @HostListener('document:touchmove', ['$event'])
    onTouchMove(event: any) {
        event.stopPropagation();
        event.preventDefault();

        if (this._isDragging && this.dragEnabled) {
            this.drag(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
        }
    }

    // Support Touch Events:
    @HostListener('document:touchend', ['$event'])
    onTouchEnd(event: MouseEvent) {
        this.revertChanges(event);
    }

    constructor(protected el: ElementRef, private renderer: Renderer,
                private ngAvatarDragDropService: NgAvatarDragDropService, private zone: NgZone) {
        this.mouseDragEvent = this.mouseDownEvent.map((event: MouseEvent) => {
            return {
                top: event.clientY - this.el.nativeElement.getBoundingClientRect().top,
                left: event.clientX - this.el.nativeElement.getBoundingClientRect().left
            };
        })
        .flatMap(
            imageOffset => this.mouseMoveEvent.map((event: MouseEvent) => {
                if (this.dragType == Draggable.DRAG_TYPE_POSITION) {
                    return {
                        top: event.clientY - imageOffset.top,
                        left: event.clientX - imageOffset.left
                    }
                } else {
                    return {
                        top: event.clientY,
                        left: event.clientX
                    }
                }
            })
            .takeUntil(this.mouseUpEvent)
        );
    }

    ngOnInit() {
        this.mouseDragEvent.subscribe({
            next: position => {
                this.drag(position.left, position.top);
            }
        });
    }

    ngOnDestroy() {
        this.unbindDragListeners();
    }

    private drag(x: number, y: number) {
        if (this.dragType == Draggable.DRAG_TYPE_POSITION) {
            this.renderer.setElementStyle(this.el.nativeElement, 'top', y + 'px');
            this.renderer.setElementStyle(this.el.nativeElement, 'left', x + 'px');
        } else {
            this._temporaryPositionObject.x = x - this._originalObject.x;
            this._temporaryPositionObject.y = y - this._originalObject.y;
            let value = `translate(${this._temporaryPositionObject.x + this._originalPositionObject.x}px, ${this._temporaryPositionObject.y + this._originalPositionObject.y}px)`;

            this.renderer.setElementStyle(this.el.nativeElement, 'transform', value);
            this.renderer.setElementStyle(this.el.nativeElement, '-webkit-transform', value);
            this.renderer.setElementStyle(this.el.nativeElement, '-ms-transform', value);
            this.renderer.setElementStyle(this.el.nativeElement, '-moz-transform', value);
            this.renderer.setElementStyle(this.el.nativeElement, '-o-transform', value);
        }
    }

    private catchupDrag(event: MouseEvent) {
        // get old z-index and position:
        this._originalZIndex = this.el.nativeElement.style.zIndex ? this.el.nativeElement.style.zIndex : '';
        this._originalPosition = this.el.nativeElement.style.position ? this.el.nativeElement.style.position : '';

        if (window) {
            this._originalZIndex = window.getComputedStyle(this.el.nativeElement, null).getPropertyValue("z-index");
            this._originalPosition = window.getComputedStyle(this.el.nativeElement, null).getPropertyValue("position");
        }

        this.ngAvatarDragDropService.dragData = this.dragData;

        // setup default position:
        let position = (this.dragType == Draggable.DRAG_TYPE_POSITION) ?
            'absolute' :
            'relative';

        // check if old position is draggable:
        if (this._originalPosition && (
            this._originalPosition === 'absolute' ||
            this._originalPosition === 'fixed' ||
            this._originalPosition === 'relative')) {
            position = this._originalPosition;
        }

        this.renderer.setElementStyle(this.el.nativeElement, 'position', position);
        this.renderer.setElementStyle(this.el.nativeElement, 'z-index', '99999');

        if (!this._isDragging) {
            event.stopPropagation();

            this.mouseDownEvent.emit(event);
            this.ngAvatarDragDropService.onDragStart.next();
            this._isDragging = true;
        }

        this.zone.runOutsideAngular(() => {
            this.unbindDragListener = this.renderer.listen(this.el.nativeElement, 'mouse', (event) => {
                this.onDrag(event);
            });
        });
    }

    private onDrag(e) {
        this.onDragEvent.emit(e);
    }

    private revertChanges(event: MouseEvent) {
        if (this._originalZIndex) {
            this.renderer.setElementStyle(this.el.nativeElement, 'z-index', this._originalZIndex);
        } else {
            this.el.nativeElement.style.removeProperty('z-index');
        }

        if (this._isDragging) {
            this._isDragging = false;
            this._originalPositionObject.x += this._temporaryPositionObject.x;
            this._originalPositionObject.y += this._temporaryPositionObject.y;
            this._temporaryPositionObject.x = this._temporaryPositionObject.y = 0;

            this.ngAvatarDragDropService.onDragEnd.next();

            event.stopPropagation();
            event.preventDefault();
        }
    }

    unbindDragListeners() {
        if (this.unbindDragListener) {
            this.unbindDragListener();
        }
    }
}