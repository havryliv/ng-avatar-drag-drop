"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var Subject_1 = require("rxjs/Subject");
var NgAvatarDragDropService = /** @class */ (function () {
    function NgAvatarDragDropService() {
        this.onDragStart = new Subject_1.Subject();
        this.onDrag = new Subject_1.Subject();
        this.onDragEnd = new Subject_1.Subject();
    }
    NgAvatarDragDropService.decorators = [
        { type: core_1.Injectable },
    ];
    /** @nocollapse */
    NgAvatarDragDropService.ctorParameters = function () { return []; };
    return NgAvatarDragDropService;
}());
exports.NgAvatarDragDropService = NgAvatarDragDropService;
//# sourceMappingURL=ng-avatar-drag-drop.service.js.map