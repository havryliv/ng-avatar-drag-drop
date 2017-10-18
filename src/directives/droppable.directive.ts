import { Directive, ElementRef, HostListener, Input, Output, EventEmitter, OnInit, HostBinding, Renderer, NgZone, OnDestroy } from '@angular/core';
import { NgAvatarDragDropService } from '../services/ng-avatar-drag-drop.service';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/takeUntil';
import {Subscription, Observable, Subject} from "rxjs";
import {AvatarMouseEvent} from "../classes/mouse-event.class";

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
    @Output() onDrop: EventEmitter<any> = new EventEmitter();

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
    dragSubscription: Subscription;

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
     */
    _dropOver: boolean;

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
    }

    dragEnter() {

    }

    dragOver() {
        if (this.allowDrop()) {
            this.renderer.setElementClass(this.el.nativeElement, this.dragOverClass, true);
        }
    }

    dragLeave() {
        if (this.allowDrop()) {
            this.renderer.setElementClass(this.el.nativeElement, this.dragOverClass, false);
        }
    }

    drop() {
        this.renderer.setElementClass(this.el.nativeElement, this.dragOverClass, false);

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
            }
        });

        this.dragSubscription = this.ngAvatarDragDropService.onDrag.subscribe(
            (dragSubject: Subject<any>) => {
                if (this.allowDrop()) {
                    let mouseEvent: AvatarMouseEvent;

                    const overlaps: Observable<boolean> = dragSubject.map(({ event, clientX, clientY }) => {
                        mouseEvent = event;

                        return this.isCoordinateWithinRectangle(
                            clientX,
                            clientY,
                            this.el.nativeElement.getBoundingClientRect()
                        );
                    });

                    const overlapsChanged: Observable<boolean> = overlaps.distinctUntilChanged();

                    overlapsChanged.filter(overlapsNow => overlapsNow).subscribe(() => {
                        this._dropOver = true;

                        this.dragEnter();

                        this.zone.run(() => {
                            this.onDragEnter.next(mouseEvent);
                        });
                    });

                    overlaps.filter(overlapsNow => overlapsNow).subscribe(() => {
                        this.dragOver();

                        this.zone.run(() => {
                            this.onDragOver.next(mouseEvent);
                        });
                    });

                    overlapsChanged
                        .pairwise()
                        .filter(([didOverlap, overlapsNow]) => didOverlap && !overlapsNow)
                        .subscribe(() => {
                            this._dropOver = false;
                            this.dragLeave();

                            this.zone.run(() => {
                                this.onDragLeave.next(mouseEvent);
                            });
                        });
                }
            }
        );

        this.dragEndSubscription = this.ngAvatarDragDropService.onDragEnd.subscribe((event: AvatarMouseEvent) => {
            this.renderer.setElementClass(this.el.nativeElement, this.dragHintClass, false);

            if (this._dropOver && this.allowDrop()) {
                event.dragData = this.ngAvatarDragDropService.dragData;
                this.drop();

                this.zone.run(() => {
                    this.onDrop.emit(event);
                });
            }
        });
    }

    unsubscribeService() {
        if (this.dragStartSubscription) {
            this.dragStartSubscription.unsubscribe();
        }
        if (this.dragSubscription) {
            this.dragSubscription.unsubscribe();
        }
        if (this.dragEndSubscription) {
            this.dragEndSubscription.unsubscribe();
        }
    }

    private isCoordinateWithinRectangle(
        clientX: number,
        clientY: number,
        rect: ClientRect
    ): boolean {
        return (
            clientX >= rect.left &&
            clientX <= rect.right &&
            clientY >= rect.top &&
            clientY <= rect.bottom
        );
    }
}