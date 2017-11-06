# Angular Avatar Drag & Drop

[![npm](https://img.shields.io/npm/dm/localeval.svg?style=flat-square)](https://www.npmjs.com/package/ng-avatar-drag-drop) [![Codacy Badge](https://api.codacy.com/project/badge/Grade/7e49399904ad4009ab4e9aadf7ec7ec9)](https://www.codacy.com/app/havryliv/ng-avatar-drag-drop?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=havryliv/ng-avatar-drag-drop&amp;utm_campaign=Badge_Grade)

Drag & Drop for Angular 2 and beyond - without using HTML5 and with no external dependencies. Please refer to the [demo](#demo) section.

# Content

1. [Demo](#demo)
2. [Installation](#installation)
3. [Usage](#usage)
4. [Limitations](#limitations)
5. [Development](#development)
6. [API Doc](#api-doc)


# Demo

Check out the [Plunker demo](http://plnkr.co/edit/e10fbXm0UDvhsIWtSto6?p=preview).

The [demo folder](https://github.com/havryliv/ng-avatar-drag-drop/tree/master/demo) of the repository contains the same demo as Plunkr that uses SystemJS. To run that demo do an `npm install` in that folder followed by `npm start` to serve the demo app.

# Installation
```js
npm install ng-avatar-drag-drop --save
```

# Usage

### Update SystemJS config
If you use SystemJS as your module loader then you will need to update the config to load the `ng-avatar-drag-drop` module.
```js
System.config({
    map: {
        'ng-avatar-drag-drop': 'node_modules/ng-avatar-drag-drop'
    },
    packages: {
        'ng-avatar-drag-drop':  { main: 'index.js',  defaultExtension: 'js' },
    }
});
```
### Import `NgAvatarDragDropModule`

You need to import the `NgAvatarDragDropModule` in the module of your app where you want to use it.

```js
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DemoComponent } from "./components/demo-component";
import { NgAvatarDragDropModule } from 'ng-avatar-drag-drop';



@NgModule({
  imports: [
      BrowserModule, 
      NgAvatarDragDropModule.forRoot()
  ],
  declarations: [DemoComponent],
  bootstrap: [DemoComponent]
})
export class AppModule {}
```

### Use the `ngAvatarDraggable` & `ngAvatarDroppable` directives
Place the `ngAvatarDraggable` directive on an element that you want to be draggable. The following example makes the
 List item draggable:

```html
<ul>
  <li ngAvatarDraggable>Coffee</li>
  <li ngAvatarDraggable>Tea</li>
  <li ngAvatarDraggable>Milk</li>
</ul>               
```

Similarly use the `ngAvatarDroppable` directive on an element where you want to drop `draggable`:
 
 ```html
 <div ngAvatarDroppable>
   <p>Drop items here</p>
 </div>               
 ```
 
 ## Setting a positioning type
 You can use `dragType` property on `ngAvatarDraggable` to set a positioning type. The Type property can by only a number.
 There are a two types of dragging - `positioning` (0) and `transform` (1).
 
 In the following example, each `ngAvatarDraggable` element has hiw own type of dragging. `Coffee` has a positioning type of dragging and `Tea` has a transform type of dragging.
 
  ```html
  <ul>
    <li ngAvatarDraggable [dragType]="0">Coffee</li>
    <li ngAvatarDraggable [dragType]="1">Tea</li>
    ...
  </ul>               
  ```
 
 
 ## Restrict Drop based on Scopes
 You can use the `dragScope` & `dropScope` property on `ngAvatarDraggable` and `ngAvatarDroppable` respectively to restrict user from dropping a `ngAvatarDraggable` element into a `ngAvatarDroppable`.
  The Scope properties can be string, an Array of string (to indicate multiple scope) or a function. The scopes must match in both to indicate compatible drag-drop zones.
  
  In the following example, only the `ngAvatarDraggable` with the `drink` dropScope can be dropped on the first `ngAvatarDroppable` and both `drink` and `meal` can be dropped in the second one.
  
 ```html
 <ul>
   <li ngAvatarDraggable [dragScope]="'drink'">Coffee</li>
   <li ngAvatarDraggable [dragScope]="'drink'">Tea</li>
   <li ngAvatarDraggable [dragScope]="'meal'">Biryani</li>
   <li ngAvatarDraggable [dragScope]="'meal'">Kebab</li>
   ...
 </ul>               
 ```
 
 ```html
 <div ngAvatarDroppable [dropScope]="'drink'" [dragOverClass]="'drag-target-border'">
   <p>Only Drinks can be dropped in the above container</p>
 </div>               
 
 <div ngAvatarDroppable [dropScope]="['drink', 'meal']" [dragOverClass]="'drag-target-border'">
   <p>Both Meal and Drinks can be dropped in the above container</p>
 </div>               
 ```
 
 ### Drop Scope as Functions
 
 The `DropScope` of the `ngAvatarDroppable` can be a function whose return value will determine if drop is allowed.
 This can be useful to implement complex logic that is otherwise not possible with string or array of string.
 
 ```html
 <div ngAvatarDroppable [dropScope]="dropAllowed" [dragOverClass]="'drag-target-border'">
   <p>Only those items are droppable for which the `isDropAllowed()` function returns true</p>
 </div>
 ```
 
 Here is how the function is defined in the component:
 ```js
 export class MyComponent {
   val = 500;
   isDropAllowed = (dragData: any) => {
     return dragData > this.val;
   }
 }
 ```
 
 Notice how the function is defined as an [Arrow Function](https://www.typescriptlang.org/docs/handbook/functions.html). You need to do this so the
 lexical scope of `this` is preserved. You also get the `dragData` in the parameter so you can compare it with whatever you want.
 
 If `DropScope` is a function, it can also return an `Observable`, which needs to later resolve to `true` or `false`. This can help in cases when
 you need to check asynchronously (eg: via http) whether the drop is allowed.
 
 ```js
 export class MyComponent {
   val = 500;
   isDropAllowed = (dragData: any) => {
     // Resolves to true or false after 1 second
     return Observable.of(dragData > this.val).delay(1000);
   }
 }
 ```
 
 ### Transfer Data via Drag Drop
 You can transfer data from the `ngAvatarDraggable` to the `ngAvatarDroppable` via the `dragData` property on the `ngAvatarDraggable` directive. 
  The data will be received in the `(onDrop)` event of the `ngAvatarDroppable`:
 
 ```js
 import {Component} from '@angular/core';
 
 @Component({
     selector: 'app',
     template: `
 <h3>Transfer Data via Drag Drop</h3>
 <div class="row">
     <div class="col-sm-3">
         <ul class="list-group">
             <li ngAvatarDraggable *ngFor="let item of items" [dragData]="item" class="list-group-item">{{item.name}}</li>
         </ul>
     </div>
     
     <div class="col-sm-3">
     <div class="panel panel-default" ngAvatarDroppable (onDrop)="onItemDrop($event)">
         <div class="panel-heading">Drop Items here</div>
             <div class="panel-body">
                 <li *ngFor="let item of droppedItems" class="list-group-item">{{item.name}}</li>
             </div>
         </div>
     </div>
 </div>
 `
 })
 export class AppComponent {
     items = [
             {name: "Apple", type: "fruit"},
             {name: "Carrot", type: "vegetable"},
             {name: "Orange", type: "fruit"}];
             
     onItemDrop(e: any) {
         // Get the dropped data here
         this.droppedItems.push(e.dragData);
     }
     constructor() { }
 }             
 ```
 
 ### Drag Handle
 Drag Handle can be defined for a `ngAvatarDraggable` item which will restrict drag of the element unless the item is dragged from the specified element.
  The handle should be a valid selector variable (`#dragHandle`). Example: 
 ```html
 <li ngAvatarDraggable>
    Not Draggable by list item but by the handle only.    
    <div class="pull-right">
        <i #dragHandle class="drag-handle fa fa-bars fa-lg" aria-hidden="true"></i>
    </div> 
 </li>               
 ```
 
 # Limitations
 This library does not uses [Native Html5 drag & drop API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API) to accomplish what it does. It uses simple positioning manipulations via position (top, left) or transform (x, y).

# API Doc
### Draggable directive

### Attributes

| Name   | Type      |Default Value |Description |
|:-------|:----------|:-------------|:-----------|
| `dragData`    |   `any` | `null` | The data that will be avaliable to the droppable directive on its `onDrop()` event. |
| `dragScope`   |    `string | Array<string>` | `'default'`   |  Defines compatible drag drop pairs. Values must match with `droppable.dropScope`. |
| `dragClass` | `string` | `'ng-avatar-drag'` | CSS class applied on the draggable that is applied when the item is being dragged. |
| `draggableClass` | `string` | `'ng-avatar-draggable'` | CSS class applied on the source draggable element. |
| `dragHandle`  | `HTMLElement` | `null` | The selector that defines the drag Handle. |
| `dragEnabled` | `boolean` | `true` | Defines if drag is enabled. `true` by default. |
| `dragType` | `number` | `0` | Defines way of dragging. There are a two ways of dragging - by `positioning` (0) and by `transform` (1) manipulations. `positioning` (0) by default. |

### Events

| Name   | Parameters  |Description |
|:-------|:------------|:-----------|
| `onDragStartEvent`  | e: DOM event   | Event fired when Drag is started  |
| `onDragEvent`       | e: DOM event   | Event fired while the element is being dragged |
| `onDragEndEvent`    | e: DOM event   | Event fired when dragged ends |

### Droppable directive

### Attributes

| Name   | Type      |Default Value |Description |
|:-------|:----------|:-------------|:-----------|
| `dropScope` |    `string | Array<string>` | `'default'`   |   Defines compatible drag drop pairs. Values must match with `draggable.dragScope` |
| `dragOverClass` | `string` | `'drag-over-border'` | CSS class applied on the droppable element when the item is being dragged over valid drop target. |
| `dragHintClass` | `string` | `'drag-hint-border'` | CSS class applied on this droppable when a compatible draggable item is being dragged. This can be used to visually show allowed drop zones. |
| `dropEnabled` | `boolean` | `true` | Defines if drop is enabled. `true` by default. |

### Events

| Name   | Parameters  |Description |
|:-------|:------------|:-----------|
| `onDragEnter`  | e: DOM event   | Event fired when Drag dragged element enters a valid drop target.  |
| `onDragOver`       | e: DOM event   | Event fired when an element is being dragged over a valid drop target. |
| `onDragLeave`    | e: DOM event   | Event fired when a dragged element leaves a valid drop target. |
| `onDrop`    | e: `DropEvent`   | Event fired when an element is dropped on a valid drop target. |

# License

MIT