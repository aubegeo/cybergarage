import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AutomobileComponent } from './automobile.component';

const routes: Routes = [
  {
    path: '',
    component: AutomobileComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AutomobileRoutingModule { }
