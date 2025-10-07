// src/app/features/landing/components/experiences-carousel.ts
import { Component, ElementRef, ViewChild, AfterViewInit, DestroyRef, inject } from '@angular/core';

@Component({
  selector: 'app-experiences-carousel',
  standalone: true,
  templateUrl: './experiences-carousel.html',
  styleUrls: ['./experiences-carousel.scss'],
})
export class ExperiencesCarouselComponent implements AfterViewInit {
  @ViewChild('xpCarousel', { static: true }) xpCarousel!: ElementRef<HTMLDivElement>;
  private destroyRef = inject(DestroyRef);

  step = () => Math.min((this.xpCarousel.nativeElement.clientWidth || 0) * 0.9, 600);

  scrollBy(delta: number) {
    const el = this.xpCarousel.nativeElement;
    el.scrollBy({ left: delta, behavior: 'smooth' });
  }

  ngAfterViewInit() {
    // (Opcional) auto-scroll suave cada N segundos; quítalo si no lo quieres.
    const id = setInterval(() => this.scrollBy(this.step()), 7000);
    this.destroyRef.onDestroy(() => clearInterval(id));
  }
}
