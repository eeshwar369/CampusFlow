import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoleSwitcherComponent } from '../components/role-switcher/role-switcher.component';
import { HeaderComponent } from '../components/header/header.component';
import { ToastComponent } from '../components/toast/toast.component';

@NgModule({
  declarations: [
    RoleSwitcherComponent,
    HeaderComponent,
    ToastComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    RoleSwitcherComponent,
    HeaderComponent,
    ToastComponent
  ]
})
export class SharedModule { }
