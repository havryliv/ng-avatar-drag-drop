"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var ng_avatar_drag_drop_service_1 = require("../services/ng-avatar-drag-drop.service");
require("rxjs/add/operator/map");
require("rxjs/add/operator/mergeMap");
require("rxjs/add/operator/takeUntil");
/**
 * Makes an element draggable by adding the draggable html attribute
 */
var Droppable = /** @class */ (function () {
    function Droppable(el, renderer, ngAvatarDragDropService, zone) {
        this.el = el;
        this.renderer = renderer;
        this.ngAvatarDragDropService = ngAvatarDragDropService;
        this.zone = zone;
        /**
         *  Event fired when Drag dragged element enters a valid drop target.
         */
        this.onDragEnter = new core_1.EventEmitter();
        /**
         * Event fired when an element is being dragged over a valid drop target
         */
        this.onDragOver = new core_1.EventEmitter();
        /**
         * Event fired when a dragged element leaves a valid drop target.
         */
        this.onDragLeave = new core_1.EventEmitter();
        /**
         * Event fired when an element is dropped on a valid drop target.
         */
        this.onDrop = new core_1.EventEmitter();
        /**
         * CSS class that is applied when a compatible draggable is being dragged over this droppable.
         */
        this.dragOverClass = 'drag-over-border';
        /**
         * CSS class applied on this droppable when a compatible draggable item is being dragged.
         * This can be used to visually show allowed drop zones.
         */
        this.dragHintClass = 'drag-hint-border';
        /**
         * Defines compatible drag drop pairs. Values must match both in draggable and droppable.dropScope.
         */
        this.dropScope = 'default';
        /**
         * @private
         * Backing field for the dropEnabled property
         */
        this._dropEnabled = true;
    }
    Object.defineProperty(Droppable.prototype, "dropEnabled", {
        get: function () {
            return this._dropEnabled;
        },
        /**
         * Defines if drop is enabled. `true` by default.
         */
        set: function (value) {
            this._dropEnabled = value;
            if (this._dropEnabled === true) {
                this.subscribeService();
            }
            else {
                this.unsubscribeService();
            }
        },
        enumerable: true,
        configurable: true
    });
    ;
    Droppable.prototype.ngOnInit = function () {
        if (this.dropEnabled === true) {
            this.subscribeService();
        }
    };
    Droppable.prototype.ngOnDestroy = function () {
        this.unsubscribeService();
    };
    Droppable.prototype.dragEnter = function () {
    };
    Droppable.prototype.dragOver = function () {
        if (this.allowDrop()) {
            this.renderer.setElementClass(this.el.nativeElement, this.dragOverClass, true);
        }
    };
    Droppable.prototype.dragLeave = function () {
        if (this.allowDrop()) {
            this.renderer.setElementClass(this.el.nativeElement, this.dragOverClass, false);
        }
    };
    Droppable.prototype.drop = function () {
        this.renderer.setElementClass(this.el.nativeElement, this.dragOverClass, false);
        this.ngAvatarDragDropService.dragData = null;
        this.ngAvatarDragDropService.scope = null;
    };
    Droppable.prototype.allowDrop = function () {
        var _this = this;
        var allowed = false;
        /* tslint:disable:curly */
        /* tslint:disable:one-line */
        if (typeof this.dropScope === 'string') {
            if (typeof this.ngAvatarDragDropService.scope === 'string')
                allowed = this.ngAvatarDragDropService.scope === this.dropScope;
            else if (this.ngAvatarDragDropService.scope instanceof Array)
                allowed = this.ngAvatarDragDropService.scope.indexOf(this.dropScope) > -1;
        }
        else if (this.dropScope instanceof Array) {
            if (typeof this.ngAvatarDragDropService.scope === 'string')
                allowed = this.dropScope.indexOf(this.ngAvatarDragDropService.scope) > -1;
            else if (this.ngAvatarDragDropService.scope instanceof Array)
                allowed = this.dropScope.filter(function (item) {
                    return _this.ngAvatarDragDropService.scope.indexOf(item) !== -1;
                }).length > 0;
        }
        else if (typeof this.dropScope === 'function') {
            allowed = this.dropScope(this.ngAvatarDragDropService.dragData);
        }
        /* tslint:enable:curly */
        /* tslint:disable:one-line */
        return allowed && this.dropEnabled;
    };
    Droppable.prototype.subscribeService = function () {
        var _this = this;
        this.dragStartSubscription = this.ngAvatarDragDropService.onDragStart.subscribe(function () {
            if (_this.allowDrop()) {
                _this.renderer.setElementClass(_this.el.nativeElement, _this.dragHintClass, true);
            }
        });
        this.dragSubscription = this.ngAvatarDragDropService.onDrag.subscribe(function (dragSubject) {
            if (_this.allowDrop()) {
                var mouseEvent_1;
                var overlaps = dragSubject.map(function (_a) {
                    var event = _a.event, clientX = _a.clientX, clientY = _a.clientY;
                    mouseEvent_1 = event;
                    return _this.isCoordinateWithinRectangle(clientX, clientY, _this.el.nativeElement.getBoundingClientRect());
                });
                var overlapsChanged = overlaps.distinctUntilChanged();
                overlapsChanged.filter(function (overlapsNow) { return overlapsNow; }).subscribe(function () {
                    _this._dropOver = true;
                    _this.dragEnter();
                    _this.zone.run(function () {
                        _this.onDragEnter.next(mouseEvent_1);
                    });
                });
                overlaps.filter(function (overlapsNow) { return overlapsNow; }).subscribe(function () {
                    _this.dragOver();
                    _this.zone.run(function () {
                        _this.onDragOver.next(mouseEvent_1);
                    });
                });
                overlapsChanged
                    .pairwise()
                    .filter(function (_a) {
                    var didOverlap = _a[0], overlapsNow = _a[1];
                    return didOverlap && !overlapsNow;
                })
                    .subscribe(function () {
                    _this._dropOver = false;
                    _this.dragLeave();
                    _this.zone.run(function () {
                        _this.onDragLeave.next(mouseEvent_1);
                    });
                });
            }
        });
        this.dragEndSubscription = this.ngAvatarDragDropService.onDragEnd.subscribe(function (event) {
            _this.renderer.setElementClass(_this.el.nativeElement, _this.dragHintClass, false);
            if (_this._dropOver && _this.allowDrop() && _this.el.nativeElement !== _this.ngAvatarDragDropService.element.nativeElement) {
                if (_this.isCoordinateWithinRectangle(event.clientX, event.clientY, _this.el.nativeElement.getBoundingClientRect())) {
                    event.dragData = _this.ngAvatarDragDropService.dragData;
                    _this.drop();
                    _this.zone.run(function () {
                        _this.onDrop.emit(event);
                    });
                }
            }
        });
    };
    Droppable.prototype.unsubscribeService = function () {
        if (this.dragStartSubscription) {
            this.dragStartSubscription.unsubscribe();
        }
        if (this.dragSubscription) {
            this.dragSubscription.unsubscribe();
        }
        if (this.dragEndSubscription) {
            this.dragEndSubscription.unsubscribe();
        }
    };
    Droppable.prototype.isCoordinateWithinRectangle = function (clientX, clientY, rect) {
        return (clientX >= rect.left &&
            clientX <= rect.right &&
            clientY >= rect.top &&
            clientY <= rect.bottom);
    };
    Droppable.decorators = [
        { type: core_1.Directive, args: [{
                    selector: '[ngAvatarDroppable]'
                },] },
    ];
    /** @nocollapse */
    Droppable.ctorParameters = function () { return [
        { type: core_1.ElementRef, },
        { type: core_1.Renderer, },
        { type: ng_avatar_drag_drop_service_1.NgAvatarDragDropService, },
        { type: core_1.NgZone, },
    ]; };
    Droppable.propDecorators = {
        'onDragEnter': [{ type: core_1.Output },],
        'onDragOver': [{ type: core_1.Output },],
        'onDragLeave': [{ type: core_1.Output },],
        'onDrop': [{ type: core_1.Output },],
        'dragOverClass': [{ type: core_1.Input },],
        'dragHintClass': [{ type: core_1.Input },],
        'dropScope': [{ type: core_1.Input },],
        'dropEnabled': [{ type: core_1.Input },],
    };
    return Droppable;
}());
exports.Droppable = Droppable;
//# sourceMappingURL=droppable.directive.js.map