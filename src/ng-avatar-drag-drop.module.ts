import { NgModule, ModuleWithProviders } from '@angular/core';
import { Draggable } from './directives/draggable.directive';
// import { Droppable } from './directives/droppable.directive';
import { NgAvatarDragDropService } from './services/ng-avatar-drag-drop.service';


@NgModule({
    imports: [],
    declarations: [
        Draggable,
        // Droppable
    ],
    exports: [
        Draggable,
        // Droppable
    ]
})
export class NgAvatarDragDropModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: NgAvatarDragDropModule,
            providers: [NgAvatarDragDropService]
        };
    }
}