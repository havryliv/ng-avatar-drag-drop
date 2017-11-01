"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var ng_avatar_drag_drop_service_1 = require("../services/ng-avatar-drag-drop.service");
require("rxjs/add/operator/map");
require("rxjs/add/operator/mergeMap");
require("rxjs/add/operator/takeUntil");
var position_class_1 = require("../classes/position.class");
var Rx_1 = require("rxjs/Rx");
/**
 * Makes an element draggable by adding the draggable html attribute
 */
var Draggable = /** @class */ (function () {
    function Draggable(el, renderer, ngAvatarDragDropService, zone) {
        var _this = this;
        this.el = el;
        this.renderer = renderer;
        this.ngAvatarDragDropService = ngAvatarDragDropService;
        this.zone = zone;
        /**
         * Defines compatible drag drop pairs. Values must match both in draggable and droppable.dropScope.
         */
        this.dragScope = 'default';
        /**
         */
        this.dragEnabled = true;
        /**
         * CSS class applied on the source draggable element.
         */
        this.draggableClass = 'ng-avatar-draggable';
        /**
         * CSS class applied on the source draggable element while being dragged.
         */
        this.dragClass = 'ng-avatar-drag';
        /**
         * The selector that defines the drag Type.
         * If defined drag will only be allowed if dragged from the selector element.
         */
        this.dragType = Draggable.DRAG_TYPE_POSITION;
        /**
         * Event fired when Drag is started
         */
        this.onDragStartEvent = new core_1.EventEmitter();
        /**
         * Event fired while the element is being dragged
         */
        this.onDragEvent = new core_1.EventEmitter();
        /**
         * Event fired when drag ends
         */
        this.onDragEndEvent = new core_1.EventEmitter();
        this.mouseUpEvent = new core_1.EventEmitter();
        this.mouseDownEvent = new core_1.EventEmitter();
        this.mouseMoveEvent = new core_1.EventEmitter();
        this.dragSubject = new Rx_1.Subject();
        this._originalZIndex = '';
        this._originalPosition = '';
        this._originalObject = null;
        this._originalPositionObject = new position_class_1.Position(0, 0);
        this._temporaryPositionObject = new position_class_1.Position(0, 0);
        this._isDragging = false;
        this.mouseDragEvent = this.mouseDownEvent.map(function (event) {
            return {
                event: event,
                top: event.clientY - _this.el.nativeElement.getBoundingClientRect().top,
                left: event.clientX - _this.el.nativeElement.getBoundingClientRect().left
            };
        })
            .flatMap(function (imageOffset) { return _this.mouseMoveEvent.map(function (event) {
            if (_this.dragType == Draggable.DRAG_TYPE_POSITION) {
                return {
                    event: event,
                    top: event.clientY - imageOffset.top,
                    left: event.clientX - imageOffset.left
                };
            }
            else {
                return {
                    event: event,
                    top: event.clientY,
                    left: event.clientX
                };
            }
        })
            .takeUntil(_this.mouseUpEvent); });
    }
    Draggable.prototype.onDragStart = function (event) {
        event.preventDefault();
        event.stopPropagation();
        this.catchupDrag(event);
        return false;
    };
    Draggable.prototype.onDragEnd = function (event) {
        return false;
    };
    Draggable.prototype.onElementMouseUp = function (event) {
        return false;
    };
    Draggable.prototype.onMouseUp = function (event) {
        event.preventDefault();
        event.stopPropagation();
        this.mouseUpEvent.emit(event);
        this.revertChanges(event);
    };
    Draggable.prototype.onMouseLeave = function (event) {
        event.stopPropagation();
        event.preventDefault();
        this.revertChanges(event);
    };
    Draggable.prototype.onMouseDown = function (event) {
        event.preventDefault();
        event.stopPropagation();
        // 1. skip right click;
        // 2. if handle is set, the element can only be moved by handle
        if (event.button == 2 || (this.dragHandle !== undefined && event.target !== this.dragHandle)) {
            return;
        }
        this._originalObject = new position_class_1.Position(event.clientX, event.clientY);
        this.catchupDrag(event);
        return false; // Call preventDefault() on the event
    };
    Draggable.prototype.onMouseMove = function (event) {
        event.stopPropagation();
        event.preventDefault();
        this.mouseMoveEvent.emit(event);
    };
    Draggable.prototype.onTouchStart = function (event) {
        event.stopPropagation();
        event.preventDefault();
        if (this.dragHandle !== undefined && event.target !== this.dragHandle) {
            return;
        }
        this._originalObject = new position_class_1.Position(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
        this.catchupDrag(event);
    };
    Draggable.prototype.onTouchMove = function (event) {
        event.stopPropagation();
        event.preventDefault();
        if (this._isDragging && this.dragEnabled) {
            this.drag(event, event.changedTouches[0].clientX, event.changedTouches[0].clientY);
        }
    };
    // Support Touch Events:
    Draggable.prototype.onTouchEnd = function (event) {
        this.revertChanges(event);
    };
    Draggable.prototype.ngOnInit = function () {
        var _this = this;
        if (this.dragEnabled) {
            this.dragElement = this.dragHandle ? this.dragHandle : this.el.nativeElement;
            this.renderer.setElementClass(this.dragElement, this.draggableClass, this.dragEnabled);
        }
        this.mouseDragEvent.subscribe({
            next: function (position) {
                _this.drag(position.event, position.left, position.top);
            }
        });
    };
    Draggable.prototype.ngOnDestroy = function () {
        this.unbindDragListeners();
        this.mouseDragEvent.unsubscribe();
    };
    Draggable.prototype.drag = function (event, x, y) {
        this.renderer.setElementClass(this.el.nativeElement, this.dragClass, true);
        if (this.dragType == Draggable.DRAG_TYPE_POSITION) {
            this.setMovementStyles(y, x);
        }
        else {
            this._temporaryPositionObject.x = x - this._originalObject.x;
            this._temporaryPositionObject.y = y - this._originalObject.y;
            this.setMovementStyles(this._temporaryPositionObject.x + this._originalPositionObject.x, this._temporaryPositionObject.y + this._originalPositionObject.y);
        }
        this.dragSubject.next({
            event: event,
            clientX: x,
            clientY: y
        });
    };
    Draggable.prototype.catchupDrag = function (event) {
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
        var position = (this.dragType == Draggable.DRAG_TYPE_POSITION) ?
            'absolute' :
            'relative';
        // check if old position is draggable:
        if (this._originalPosition && (this._originalPosition === 'absolute' ||
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
    };
    Draggable.prototype.onDrag = function (e) {
        this.onDragEvent.emit(e);
    };
    Draggable.prototype.revertChanges = function (event) {
        if (this._originalZIndex) {
            this.renderer.setElementStyle(this.el.nativeElement, 'z-index', this._originalZIndex);
        }
        else {
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
            this.onDragEndEvent.emit(event);
            this.ngAvatarDragDropService.onDragEnd.next(event);
        }
    };
    Draggable.prototype.setMovementStyles = function (top, left) {
        if (this.dragType == Draggable.DRAG_TYPE_POSITION) {
            this.renderer.setElementStyle(this.el.nativeElement, 'top', top + 'px');
            this.renderer.setElementStyle(this.el.nativeElement, 'left', left + 'px');
        }
        else {
            var value = "translate(" + top + "px, " + left + "px)";
            this.renderer.setElementStyle(this.el.nativeElement, 'transform', value);
            this.renderer.setElementStyle(this.el.nativeElement, '-webkit-transform', value);
            this.renderer.setElementStyle(this.el.nativeElement, '-ms-transform', value);
            this.renderer.setElementStyle(this.el.nativeElement, '-moz-transform', value);
            this.renderer.setElementStyle(this.el.nativeElement, '-o-transform', value);
        }
    };
    Draggable.prototype.unbindDragListeners = function () {
        if (this.unbindDragListener) {
            this.unbindDragListener();
        }
    };
    Draggable.DRAG_TYPE_POSITION = 0;
    Draggable.DRAG_TYPE_TRANSFORM = 1;
    Draggable.decorators = [
        { type: core_1.Directive, args: [{
                    selector: '[ngAvatarDraggable]'
                },] },
    ];
    /** @nocollapse */
    Draggable.ctorParameters = function () { return [
        { type: core_1.ElementRef, },
        { type: core_1.Renderer, },
        { type: ng_avatar_drag_drop_service_1.NgAvatarDragDropService, },
        { type: core_1.NgZone, },
    ]; };
    Draggable.propDecorators = {
        'dragData': [{ type: core_1.Input },],
        'dragHandle': [{ type: core_1.Input },],
        'dragScope': [{ type: core_1.Input },],
        'dragEnabled': [{ type: core_1.Input },],
        'draggableClass': [{ type: core_1.Input },],
        'dragClass': [{ type: core_1.Input },],
        'dragType': [{ type: core_1.Input },],
        'onDragStartEvent': [{ type: core_1.Output },],
        'onDragEvent': [{ type: core_1.Output },],
        'onDragEndEvent': [{ type: core_1.Output },],
        'onDragStart': [{ type: core_1.HostListener, args: ['dragstart', ['$event'],] },],
        'onDragEnd': [{ type: core_1.HostListener, args: ['dragend', ['$event'],] },],
        'onElementMouseUp': [{ type: core_1.HostListener, args: ['mouseup', ['$event'],] },],
        'onMouseUp': [{ type: core_1.HostListener, args: ['document:mouseup', ['$event'],] },],
        'onMouseLeave': [{ type: core_1.HostListener, args: ['document:mouseleave', ['$event'],] },],
        'onMouseDown': [{ type: core_1.HostListener, args: ['mousedown', ['$event'],] },],
        'onMouseMove': [{ type: core_1.HostListener, args: ['document:mousemove', ['$event'],] },],
        'onTouchStart': [{ type: core_1.HostListener, args: ['touchstart', ['$event'],] },],
        'onTouchMove': [{ type: core_1.HostListener, args: ['document:touchmove', ['$event'],] },],
        'onTouchEnd': [{ type: core_1.HostListener, args: ['document:touchend', ['$event'],] },],
    };
    return Draggable;
}());
exports.Draggable = Draggable;
//# sourceMappingURL=draggable.directive.js.map