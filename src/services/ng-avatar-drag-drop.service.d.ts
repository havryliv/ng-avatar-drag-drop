import { ElementRef } from '@angular/core';
import { Subject } from 'rxjs/Subject';
export declare class NgAvatarDragDropService {
    element: ElementRef;
    dragData: any;
    scope: string | Array<string>;
    onDragStart: Subject<any>;
    onDrag: Subject<any>;
    onDragEnd: Subject<any>;
    constructor();
}
