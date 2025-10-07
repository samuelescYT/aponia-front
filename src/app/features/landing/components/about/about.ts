// features/landing/components/about.component.ts
import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';

@Component({
  selector: 'app-about',
  standalone: true,
  templateUrl: './about.html' ,
})
export class AboutComponent implements OnInit, OnDestroy {

  readonly images = ['img/cowork.jpg', 'img/restaurante.jpg', 'img/spa.jpg', 'img/suite-lujo.jpg'];
  index = signal(0);
  fading = signal(false);

  currentImage = computed(() => this.images[this.index()]);
  private intervalId?: number;

  ngOnInit() {
    this.intervalId = window.setInterval(() => this.next(), 4000);
  }

  ngOnDestroy() {
    if (this.intervalId) window.clearInterval(this.intervalId);
  }

  go(i: number) {
    this.fade(() => this.index.set(i));
  }

  next() {
    this.fade(() => this.index.update(v => (v + 1) % this.images.length));
  }

  private fade(cb: () => void) {
    this.fading.set(true);
    setTimeout(() => { cb(); this.fading.set(false); }, 700);
  }
}
