import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutomobileRoutingModule } from './automobile-routing-module';

// Ce module n'est plus utilisé depuis la conversion en composant standalone

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    AutomobileRoutingModule
  ]
})
export class AutomobileModule { }
