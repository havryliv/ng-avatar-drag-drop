import { Directive, ElementRef, HostListener, Input, Output, EventEmitter, OnInit, HostBinding, Renderer, NgZone, OnDestroy } from '@angular/core';
import { NgAvatarDragDropService } from '../services/ng-avatar-drag-drop.service';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/takeUntil';
import {Subscription} from "rxjs";
import {DropEvent} from "../classes/drop-event.class";

@Directive({
    selector: '[ngAvatarDroppable]'
})
/**
 * Makes an element draggable by adding the draggable html attribute
 */
export class Droppable implements OnInit, OnDestroy {
    /**
     *  Event fired when Drag dragged element enters a valid drop target.
     */
    @Output() onDragEnter: EventEmitter<any> = new EventEmitter();

    /**
     * Event fired when an element is being dragged over a valid drop target
     */
    @Output() onDragOver: EventEmitter<any> = new EventEmitter();

    /**
     * Event fired when a dragged element leaves a valid drop target.
     */
    @Output() onDragLeave: EventEmitter<any> = new EventEmitter();

    /**
     * Event fired when an element is dropped on a valid drop target.
     */
    @Output() onDrop: EventEmitter<DropEvent> = new EventEmitter();

    /**
     * CSS class that is applied when a compatible draggable is being dragged over this droppable.
     */
    @Input() dragOverClass = 'drag-over-border';

    /**
     * CSS class applied on this droppable when a compatible draggable item is being dragged.
     * This can be used to visually show allowed drop zones.
     */
    @Input() dragHintClass = 'drag-hint-border';

    /**
     * Defines compatible drag drop pairs. Values must match both in draggable and droppable.dropScope.
     */
    @Input() dropScope: string | Array<string> | Function  = 'default';

    /**
     * Defines if drop is enabled. `true` by default.
     */
    @Input() set dropEnabled(value: boolean) {
        this._dropEnabled = value;

        if (this._dropEnabled === true) {
            this.subscribeService();
        } else {
            this.unsubscribeService();
        }
    };

    get dropEnabled() {
        return this._dropEnabled;
    }

    /**
     * @private
     */
    dragStartSubscription: Subscription;

    /**
     * @private
     */
    dragEndSubscription: Subscription;


    /**
     * @private
     * Backing field for the dropEnabled property
     */
    _dropEnabled = true;

    /**
     * @private
     * Function for unbinding the drag enter listener
     */
    unbindDragEnterListener: Function;

    /**
     * @private
     * Function for unbinding the drag over listener
     */
    unbindDragOverListener: Function;

    /**
     * @private
     * Function for unbinding the drag leave listener
     */
    unbindDragLeaveListener: Function;

    constructor(protected el: ElementRef, private renderer: Renderer,
                private ngAvatarDragDropService: NgAvatarDragDropService, private zone: NgZone) {
    }

    ngOnInit() {
        if (this.dropEnabled === true) {
            this.subscribeService();
        }
    }

    ngOnDestroy() {
        this.unsubscribeService();
        this.unbindDragListeners();
    }

    dragEnter(e) {
        console.log('dragEnter', this.allowDrop());
        if (this.allowDrop()) {
            this.renderer.setElementClass(this.el.nativeElement, this.dragOverClass, true);
            e.preventDefault();
            e.stopPropagation();
            this.onDragEnter.emit(e);
        }
    }

    dragOver(e) {
        if (this.allowDrop()) {
            this.renderer.setElementClass(this.el.nativeElement, this.dragOverClass, true);
            e.preventDefault();
            this.onDragOver.emit(e);
        }
    }

    dragLeave(e) {
        this.renderer.setElementClass(this.el.nativeElement, this.dragOverClass, false);
        e.preventDefault();
        this.onDragLeave.emit(e);
    }

    @HostListener('document:mouseup', ['$event'])
    drop(e) {
        this.renderer.setElementClass(this.el.nativeElement, this.dragOverClass, false);
        e.preventDefault();
        e.stopPropagation();

        this.ngAvatarDragDropService.onDragEnd.next();
        this.onDrop.emit(new DropEvent(e, this.ngAvatarDragDropService.dragData));
        this.ngAvatarDragDropService.dragData = null;
        this.ngAvatarDragDropService.scope = null;
    }

    allowDrop(): boolean {
        let allowed = false;

        /* tslint:disable:curly */
        /* tslint:disable:one-line */
        if (typeof this.dropScope === 'string') {
            if (typeof this.ngAvatarDragDropService.scope === 'string')
                allowed = this.ngAvatarDragDropService.scope === this.dropScope;
            else if (this.ngAvatarDragDropService.scope instanceof Array)
                allowed = this.ngAvatarDragDropService.scope.indexOf(this.dropScope) > -1;
        } else if (this.dropScope instanceof Array) {
            if (typeof this.ngAvatarDragDropService.scope === 'string')
                allowed = this.dropScope.indexOf(this.ngAvatarDragDropService.scope) > -1;
            else if (this.ngAvatarDragDropService.scope instanceof Array)
                allowed = this.dropScope.filter(item => {
                    return this.ngAvatarDragDropService.scope.indexOf(item) !== -1;
                }).length > 0;
        } else if (typeof this.dropScope === 'function') {
            allowed = this.dropScope(this.ngAvatarDragDropService.dragData);
        }
        /* tslint:enable:curly */
        /* tslint:disable:one-line */

        return allowed && this.dropEnabled;
    }

    subscribeService() {
        this.dragStartSubscription = this.ngAvatarDragDropService.onDragStart.subscribe(() => {
            if (this.allowDrop()) {
                this.renderer.setElementClass(this.el.nativeElement, this.dragHintClass, true);

                this.zone.runOutsideAngular(() => {
                    this.unbindDragEnterListener = this.renderer.listen(this.el.nativeElement, 'mouseenter', (dragEvent) => {
                        this.dragEnter(dragEvent);
                    });
                    this.unbindDragOverListener = this.renderer.listen(this.el.nativeElement, 'mouseover', (dragEvent) => {
                        this.dragOver(dragEvent);
                    });
                    this.unbindDragLeaveListener = this.renderer.listen(this.el.nativeElement, 'document:mouseleave', (dragEvent) => {
                        this.dragLeave(dragEvent);
                    });
                    this.unbindDragLeaveListener = this.renderer.listen(this.el.nativeElement, 'document:mouseout', (dragEvent) => {
                        this.dragLeave(dragEvent);
                    });
                });
            }
        });

        this.dragEndSubscription = this.ngAvatarDragDropService.onDragEnd.subscribe(() => {
            this.renderer.setElementClass(this.el.nativeElement, this.dragHintClass, false);
            this.unbindDragListeners();
        });
    }

    unsubscribeService() {
        if (this.dragStartSubscription) {
            this.dragStartSubscription.unsubscribe();
        }
        if (this.dragEndSubscription) {
            this.dragEndSubscription.unsubscribe();
        }
    }

    unbindDragListeners() {
        if (this.unbindDragEnterListener) {
            this.unbindDragEnterListener();
        }
        if (this.unbindDragOverListener) {
            this.unbindDragEnterListener();
        }
        if (this.unbindDragLeaveListener) {
            this.unbindDragEnterListener();
        }
    }
}