import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class leftSidebarService {
  sidebarOpen = signal(true);

  setRightSidebar(value: boolean) {
    this.sidebarOpen.set(value);
  }

  toggle() {
    this.sidebarOpen.update(v => !v);
  }
}
