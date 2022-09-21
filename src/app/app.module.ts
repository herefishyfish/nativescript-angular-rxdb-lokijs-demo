import { APP_INITIALIZER, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptCommonModule, NativeScriptModule } from '@nativescript/angular';

// import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DatabaseService, initDatabase } from './core/db/database.service';
import { HeroComponent } from './components/hero.component';

@NgModule({
  bootstrap: [AppComponent],
  imports: [NativeScriptModule, NativeScriptCommonModule],
  declarations: [AppComponent, HeroComponent],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: () => initDatabase,
      multi: true,
    },
    DatabaseService
  ],
  schemas: [NO_ERRORS_SCHEMA],
})
export class AppModule {}
