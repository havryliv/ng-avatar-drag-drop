import { ElementRef, EventEmitter, OnInit, Renderer, NgZone, OnDestroy } from '@angular/core';
import { NgAvatarDragDropService } from '../services/ng-avatar-drag-drop.service';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/takeUntil';
import { Position } from "../classes/position.class";
import { Subject } from "rxjs/Rx";
import { AvatarMouseEvent } from "../classes/mouse-event.class";
export declare class Draggable implements OnInit, OnDestroy {
    protected el: ElementRef;
    private renderer;
    private ngAvatarDragDropService;
    private zone;
    static DRAG_TYPE_POSITION: number;
    static DRAG_TYPE_TRANSFORM: number;
    /**
     * The data that will be avaliable to the droppable directive on its `onDrop()` event.
     */
    dragData: any;
    /**
     * The selector that defines the drag Handle.
     * If defined drag will only be allowed if dragged from the selector element.
     */
    dragHandle: HTMLElement;
    /**
     * Defines compatible drag drop pairs. Values must match both in draggable and droppable.dropScope.
     */
    dragScope: string | Array<string>;
    /**
     */
    dragEnabled: boolean;
    /**
     * CSS class applied on the source draggable element.
     */
    draggableClass: string;
    /**
     * CSS class applied on the source draggable element while being dragged.
     */
    dragClass: string;
    /**
     * The selector that defines the drag Type.
     * If defined drag will only be allowed if dragged from the selector element.
     */
    dragType: number;
    /**
     * Event fired when Drag is started
     */
    onDragStartEvent: EventEmitter<any>;
    /**
     * Event fired while the element is being dragged
     */
    onDragEvent: EventEmitter<any>;
    /**
     * Event fired when drag ends
     */
    onDragEndEvent: EventEmitter<any>;
    /**
     * @private
     * Function for unbinding the drag listener
     */
    unbindDragListener: Function;
    mouseDragEvent: any;
    mouseUpEvent: EventEmitter<{}>;
    mouseDownEvent: EventEmitter<{}>;
    mouseMoveEvent: EventEmitter<{}>;
    dragElement: any;
    dragSubject: Subject<any>;
    _originalZIndex: string;
    _originalPosition: string;
    _originalObject: Position;
    _originalPositionObject: Position;
    _temporaryPositionObject: Position;
    _isDragging: boolean;
    onDragStart(event: any): boolean;
    onDragEnd(event: any): boolean;
    onElementMouseUp(event: AvatarMouseEvent): boolean;
    onMouseUp(event: AvatarMouseEvent): void;
    onMouseLeave(event: AvatarMouseEvent): void;
    onMouseDown(event: AvatarMouseEvent): boolean;
    onMouseMove(event: AvatarMouseEvent): void;
    onTouchStart(event: any): void;
    onTouchMove(event: any): void;
    onTouchEnd(event: AvatarMouseEvent): void;
    constructor(el: ElementRef, renderer: Renderer, ngAvatarDragDropService: NgAvatarDragDropService, zone: NgZone);
    ngOnInit(): void;
    ngOnDestroy(): void;
    private drag(event, x, y);
    private catchupDrag(event);
    private onDrag(e);
    private revertChanges(event);
    private setMovementStyles(top, left);
    unbindDragListeners(): void;
}
