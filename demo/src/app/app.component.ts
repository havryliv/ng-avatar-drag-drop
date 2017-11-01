import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';

  onFirstBoxDrop(event) {
    console.log(event);
  }

  onSecondBoxDrop(event) {
    console.log(event);
  }
}
