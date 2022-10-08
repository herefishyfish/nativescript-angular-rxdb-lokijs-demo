import { Component, inject, Input } from '@angular/core';
import { Dialogs, GestureEventData, isIOS } from '@nativescript/core';
import { DatabaseService } from '../core/db/database.service';
import { RxHeroDocumentType } from '../core/db/schema';
import { RxDocument } from 'rxdb';

@Component({
  selector: 'app-hero',
  template: `
    <StackLayout class="hero-card" (tap)="onTap()" (longPress)="onLongPress($event)" orientation="horizontal">
      <Label text="{{ hero?.name }}'s favorite color is: " textWrap="true"></Label>
      <StackLayout width="20" height="20" [backgroundColor]="hero?.color"></StackLayout>
    </StackLayout>
  `,
  styles: [
    `
      .hero-card {
        border-radius: 4;
        border-width: 1;
        border-color: #d3d3d4;
        padding: 10;
        width: 100%;
        margin-bottom: 8;
        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
      }
    `,
  ],
})
export class HeroComponent {
  @Input() hero: RxDocument<RxHeroDocumentType>;
  _rxdb = inject(DatabaseService);

  onTap() {
    Dialogs.prompt('Change hero name', this.hero.name).then((promptResult) => {
      if (promptResult.result == true) {
        this._rxdb.database.heroes.upsert({
          id: this.hero.id,
          color: this.hero.color,
          name: promptResult.text,
          updatedAt: new Date().toISOString(),
        });
      }
    });
  }

  async onLongPress(event: GestureEventData) {
    if (isIOS && event.ios.state !== UIGestureRecognizerState.Ended) return;

    const result = await Dialogs.confirm('Are you sure you would like to delete this hero?');

    if(result) {
      this.hero.remove();
    }
  }
}
