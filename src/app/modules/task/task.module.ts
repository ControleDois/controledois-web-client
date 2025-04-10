import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskComponent } from './task.component';
import { ProjectBoardComponent } from './components/project-board/project-board.component';
import { MaterialModule } from 'src/app/shared/modules/material.module';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SidebarToggleComponent } from './components/sidebar-toggle/sidebar-toggle.component';
import { BrowserModule } from '@angular/platform-browser';
import { SidebarComponent } from './components/sidebar/sidebar.component';



@NgModule({
  declarations: [
    TaskComponent,
    ProjectBoardComponent,
    NavbarComponent,
    SidebarToggleComponent,
    SidebarComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    BrowserModule
  ]
})
export class TaskModule { }
