import { Component, OnInit, inject } from '@angular/core'
import { Observable, tap } from 'rxjs';
import { DatabaseService } from './core/db/database.service'
import 'zone.js/dist/zone-patch-rxjs';

@Component({
  selector: 'ns-app',
  template: `
    <GridLayout rows="*, auto" columns="*, auto">
      <ScrollView class="scroll-view">
        <StackLayout class="content">
          <app-hero 
            *ngFor="let hero of heros$ | async" 
            [hero]="hero">
          </app-hero>
        </StackLayout>
      </ScrollView>
      <Button 
        class="button m-2 p-4 font-bold text-white rounded-full bg-blue-300"
        text="Add a new hero!"
        (tap)="addHero()">
      </Button>
    </GridLayout>
`,
styles:[`
  .scroll-view { 
    row-span: 2;
    col-span: 2;
  }
  .content {
    padding: 10;
  }
  .button: {
    row: 2;
    col: 2;
  }
`]
})
export class AppComponent implements OnInit {
  _rxdb = inject(DatabaseService);
  heros$: Observable<any[]>;

  ngOnInit(): void {
    this.heros$ = this._rxdb.database.heroes
      .find({
        selector: {},
        sort: [{ name: 'asc' }],
      })
      .$.pipe(
        tap((hero: any[]) => {
          console.log(hero.map((e) => e.name));
        })
      );
  }

  addHero() {
    this._rxdb.addHero();
  }
}
