import { Directive, ElementRef, HostListener, Input, Output, EventEmitter, OnInit, HostBinding, Renderer, NgZone, OnDestroy } from '@angular/core';
import { NgAvatarDragDropService } from '../services/ng-avatar-drag-drop.service';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/takeUntil';
import {Position} from "../classes/position.class";
import {Subject} from "rxjs";
import {AvatarMouseEvent} from "../classes/mouse-event.class";

@Directive({
    selector: '[ngAvatarDraggable]'
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
     * Defines compatible drag drop pairs. Values must match both in draggable and droppable.dropScope.
     */
    @Input() dragScope: string | Array<string> = 'default';

    /**
     */
    @Input() dragEnabled: boolean = true;

    /**
     * CSS class applied on the source draggable element.
     */
    @Input() draggableClass = 'ng-avatar-draggable';

    /**
     * CSS class applied on the source draggable element while being dragged.
     */
    @Input() dragClass = 'ng-avatar-drag';

    /**
     * The selector that defines the drag Type.
     * If defined drag will only be allowed if dragged from the selector element.
     */
    @Input() dragType: number = Draggable.DRAG_TYPE_POSITION;

    /**
     * Event fired when Drag is started
     */
    @Output() onDragStartEvent: EventEmitter<any> = new EventEmitter();

    /**
     * Event fired while the element is being dragged
     */
    @Output() onDragEvent: EventEmitter<any> = new EventEmitter();

    /**
     * Event fired when drag ends
     */
    @Output() onDragEndEvent: EventEmitter<any> = new EventEmitter();

    /**
     * @private
     * Function for unbinding the drag listener
     */
    unbindDragListener: Function;

    mouseDragEvent;
    mouseUpEvent = new EventEmitter();
    mouseDownEvent = new EventEmitter();
    mouseMoveEvent = new EventEmitter();

    dragElement;
    dragSubject: Subject<any> = new Subject();

    _originalZIndex: string = '';
    _originalPosition: string = '';
    _originalObject: Position = null;
    _originalPositionObject: Position = new Position(0, 0);
    _temporaryPositionObject: Position = new Position(0, 0);

    _isDragging: boolean = false;

    @HostListener('dragstart', ['$event'])
    onDragStart(event) {
        event.preventDefault();

        this.catchupDrag(event);
        return false;
    }

    @HostListener('dragend', ['$event'])
    onDragEnd(event) {
        return false;
    }

    @HostListener('document:mouseup', ['$event'])
    onMouseUp(event: AvatarMouseEvent) {
        event.stopPropagation();
        event.preventDefault();

        this.mouseUpEvent.emit(event);
        this.revertChanges(event);
    }

    @HostListener('document:mouseleave', ['$event'])
    onMouseLeave(event: AvatarMouseEvent) {
        this.revertChanges(event);
    }

    @HostListener('mousedown', ['$event'])
    onMouseDown(event: AvatarMouseEvent) {
        event.stopPropagation();
        event.preventDefault();

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
    onMouseMove(event: AvatarMouseEvent) {
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
            this.drag(event, event.changedTouches[0].clientX, event.changedTouches[0].clientY);
        }
    }

    // Support Touch Events:
    @HostListener('document:touchend', ['$event'])
    onTouchEnd(event: AvatarMouseEvent) {
        this.revertChanges(event);
    }

    constructor(protected el: ElementRef, private renderer: Renderer,
                private ngAvatarDragDropService: NgAvatarDragDropService, private zone: NgZone) {
        this.mouseDragEvent = this.mouseDownEvent.map((event: AvatarMouseEvent) => {
            return {
                event: event,
                top: event.clientY - this.el.nativeElement.getBoundingClientRect().top,
                left: event.clientX - this.el.nativeElement.getBoundingClientRect().left
            };
        })
        .flatMap(
            imageOffset => this.mouseMoveEvent.map((event: AvatarMouseEvent) => {
                if (this.dragType == Draggable.DRAG_TYPE_POSITION) {
                    return {
                        event: event,
                        top: event.clientY - imageOffset.top,
                        left: event.clientX - imageOffset.left
                    }
                } else {
                    return {
                        event: event,
                        top: event.clientY,
                        left: event.clientX
                    }
                }
            })
            .takeUntil(this.mouseUpEvent)
        );
    }

    ngOnInit() {
        if (this.dragEnabled) {
            this.dragElement = this.dragHandle ? this.dragHandle : this.el.nativeElement;

            this.renderer.setElementClass(this.dragElement, this.draggableClass, this.dragEnabled);
        }

        this.mouseDragEvent.subscribe({
            next: position => {
                this.drag(position.event, position.left, position.top);
            }
        });
    }

    ngOnDestroy() {
        this.unbindDragListeners();
        this.mouseDragEvent.unsubscribe();
    }

    private drag(event: any, x: number, y: number) {
        this.renderer.setElementClass(this.el.nativeElement, this.dragClass, true);

        if (this.dragType == Draggable.DRAG_TYPE_POSITION) {
            this.setMovementStyles(y, x);
        } else {
            this._temporaryPositionObject.x = x - this._originalObject.x;
            this._temporaryPositionObject.y = y - this._originalObject.y;

            this.setMovementStyles(this._temporaryPositionObject.x + this._originalPositionObject.x, this._temporaryPositionObject.y + this._originalPositionObject.y);
        }

        this.dragSubject.next({
            event: event,
            clientX: x,
            clientY: y
        });
    }

    private catchupDrag(event: AvatarMouseEvent) {
        if (!this.dragEnabled) {
            return;
        }

        // get old z-index and position:
        this._originalZIndex = this.el.nativeElement.style.zIndex ? this.el.nativeElement.style.zIndex : '';
        this._originalPosition = this.el.nativeElement.style.position ? this.el.nativeElement.style.position : '';

        if (window) {
            this._originalZIndex = window.getComputedStyle(this.el.nativeElement, null).getPropertyValue("z-index");
            this._originalPosition = window.getComputedStyle(this.el.nativeElement, null).getPropertyValue("position");
        }

        this.ngAvatarDragDropService.element = this.el;
        this.ngAvatarDragDropService.dragData = this.dragData;
        this.ngAvatarDragDropService.scope = this.dragScope;

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
            this.onDragStartEvent.emit(event);

            this.ngAvatarDragDropService.onDragStart.next();

            this._isDragging = true;

            this.dragSubject.next({
                event: event,
                clientX: 0,
                clientY: 0
            });
        }

        this.ngAvatarDragDropService.onDrag.next(this.dragSubject);
    }

    private onDrag(e) {
        this.onDragEvent.emit(e);
    }

    private revertChanges(event: AvatarMouseEvent) {
        if (this._originalZIndex) {
            this.renderer.setElementStyle(this.el.nativeElement, 'z-index', this._originalZIndex);
        } else {
            this.el.nativeElement.style.removeProperty('z-index');
        }

        if (this._isDragging) {
            this.renderer.setElementClass(this.el.nativeElement, this.dragClass, false);
            this._isDragging = false;

            if (this.dragType == Draggable.DRAG_TYPE_POSITION) {
                this._originalPositionObject.x += this._temporaryPositionObject.x;
                this._originalPositionObject.y += this._temporaryPositionObject.y;
            }

            this._temporaryPositionObject.x = this._temporaryPositionObject.y = 0;
            this.setMovementStyles(0, 0);

            this.ngAvatarDragDropService.onDragEnd.next(event);
            this.onDragEndEvent.emit(event);
        }
    }

    private setMovementStyles(top: number, left: number) {
        if (this.dragType == Draggable.DRAG_TYPE_POSITION) {
            this.renderer.setElementStyle(this.el.nativeElement, 'top', top + 'px');
            this.renderer.setElementStyle(this.el.nativeElement, 'left', left + 'px');
        } else {
            let value = `translate(${top}px, ${left}px)`;

            this.renderer.setElementStyle(this.el.nativeElement, 'transform', value);
            this.renderer.setElementStyle(this.el.nativeElement, '-webkit-transform', value);
            this.renderer.setElementStyle(this.el.nativeElement, '-ms-transform', value);
            this.renderer.setElementStyle(this.el.nativeElement, '-moz-transform', value);
            this.renderer.setElementStyle(this.el.nativeElement, '-o-transform', value);
        }
    }

    unbindDragListeners() {
        if (this.unbindDragListener) {
            this.unbindDragListener();
        }
    }
}