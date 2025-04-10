import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-sidebar-toggle',
  templateUrl: './sidebar-toggle.component.html',
  styleUrls: ['./sidebar-toggle.component.scss'],
})
export class SidebarToggleComponent {
  @Output() openSidebar = new EventEmitter<void>();

  expandSidebar(): void {
    this.openSidebar.emit();
  }
}
