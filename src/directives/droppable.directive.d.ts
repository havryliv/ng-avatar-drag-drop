import { ElementRef, EventEmitter, OnInit, Renderer, NgZone, OnDestroy } from '@angular/core';
import { NgAvatarDragDropService } from '../services/ng-avatar-drag-drop.service';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/takeUntil';
import { Subscription } from "rxjs";
export declare class Droppable implements OnInit, OnDestroy {
    protected el: ElementRef;
    private renderer;
    private ngAvatarDragDropService;
    private zone;
    /**
     *  Event fired when Drag dragged element enters a valid drop target.
     */
    onDragEnter: EventEmitter<any>;
    /**
     * Event fired when an element is being dragged over a valid drop target
     */
    onDragOver: EventEmitter<any>;
    /**
     * Event fired when a dragged element leaves a valid drop target.
     */
    onDragLeave: EventEmitter<any>;
    /**
     * Event fired when an element is dropped on a valid drop target.
     */
    onDrop: EventEmitter<any>;
    /**
     * CSS class that is applied when a compatible draggable is being dragged over this droppable.
     */
    dragOverClass: string;
    /**
     * CSS class applied on this droppable when a compatible draggable item is being dragged.
     * This can be used to visually show allowed drop zones.
     */
    dragHintClass: string;
    /**
     * Defines compatible drag drop pairs. Values must match both in draggable and droppable.dropScope.
     */
    dropScope: string | Array<string> | Function;
    /**
     * Defines if drop is enabled. `true` by default.
     */
    dropEnabled: boolean;
    /**
     * @private
     */
    dragStartSubscription: Subscription;
    /**
     * @private
     */
    dragSubscription: Subscription;
    /**
     * @private
     */
    dragEndSubscription: Subscription;
    /**
     * @private
     * Backing field for the dropEnabled property
     */
    _dropEnabled: boolean;
    /**
     * @private
     */
    _dropOver: boolean;
    constructor(el: ElementRef, renderer: Renderer, ngAvatarDragDropService: NgAvatarDragDropService, zone: NgZone);
    ngOnInit(): void;
    ngOnDestroy(): void;
    dragEnter(): void;
    dragOver(): void;
    dragLeave(): void;
    drop(): void;
    allowDrop(): boolean;
    subscribeService(): void;
    unsubscribeService(): void;
    private isCoordinateWithinRectangle(clientX, clientY, rect);
}
