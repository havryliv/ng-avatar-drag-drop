import {Injectable, ElementRef} from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class NgAvatarDragDropService {
    element: ElementRef;
    dragData: any;
    scope: string | Array<string>;
    onDragStart = new Subject<any>();
    onDrag = new Subject<any>();
    onDragEnd = new Subject<any>();

    constructor() {
    }
}