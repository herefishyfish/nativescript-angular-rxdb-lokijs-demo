import { Component, OnDestroy, OnInit, inject } from '@angular/core'
import { Subject, Observable, tap } from 'rxjs';
import { DatabaseService } from './core/db/database.service'

@Component({
  selector: 'ns-app',
  template: `
  <StackLayout>
    <Label *ngFor="let hero of heros$ | async" [text]="hero.name" textWrap="true"></Label>
  
    <Button text="Add a new hero!" (tap)="addHero()"></Button>
  </StackLayout>
`
})
export class AppComponent implements OnDestroy, OnInit {
  db = inject(DatabaseService);
  destroy$ = new Subject<void>();
  heros$: Observable<any[]>;

  ngOnInit(): void {
    this.heros$ = this.db.database.heroes
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  addHero() {
    this.db.addHero();
  }
}
