import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgAvatarDragDropModule } from 'ng-avatar-drag-drop';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NgAvatarDragDropModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
