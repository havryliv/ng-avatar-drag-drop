"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var draggable_directive_1 = require("./directives/draggable.directive");
var droppable_directive_1 = require("./directives/droppable.directive");
var ng_avatar_drag_drop_service_1 = require("./services/ng-avatar-drag-drop.service");
var NgAvatarDragDropModule = /** @class */ (function () {
    function NgAvatarDragDropModule() {
    }
    NgAvatarDragDropModule.forRoot = function () {
        return {
            ngModule: NgAvatarDragDropModule,
            providers: [ng_avatar_drag_drop_service_1.NgAvatarDragDropService]
        };
    };
    NgAvatarDragDropModule.decorators = [
        { type: core_1.NgModule, args: [{
                    imports: [],
                    declarations: [
                        draggable_directive_1.Draggable,
                        droppable_directive_1.Droppable
                    ],
                    exports: [
                        draggable_directive_1.Draggable,
                        droppable_directive_1.Droppable
                    ]
                },] },
    ];
    /** @nocollapse */
    NgAvatarDragDropModule.ctorParameters = function () { return []; };
    return NgAvatarDragDropModule;
}());
exports.NgAvatarDragDropModule = NgAvatarDragDropModule;
//# sourceMappingURL=ng-avatar-drag-drop.module.js.map