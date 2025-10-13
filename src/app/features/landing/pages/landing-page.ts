import { StepsComponent } from './../components/steps/steps';
import { FooterComponent } from './../components/footer/footer';
import { CtaFinalComponent } from './../components/cta-final/cta-final';
import { TestimonialsComponent } from './../components/testimonials/testimonials';
import { ExperiencesCarouselComponent } from './../components/experiences-carousel/experiences-carousel';
import { ServicesComponent } from './../components/services/services';
import { RoomsGridComponent } from './../components/rooms-grid/rooms-grid';
import { Component, inject } from '@angular/core';
import { HeaderComponent } from '../components/header/header';
import { HeroComponent } from '../components/hero/hero';
import { AboutComponent } from '../components/about/about';
import { AuthService } from '../../../core/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  imports: [
    HeaderComponent, HeroComponent, AboutComponent, RoomsGridComponent,
    ServicesComponent, ExperiencesCarouselComponent, TestimonialsComponent,
    StepsComponent, CtaFinalComponent, FooterComponent
  ],
  templateUrl: './landing-page.html',
})
export class LandingPageComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  async ngOnInit() {
    // Intenta restaurar la sesión desde la cookie
    await this.auth.restoreSession();

    // Si ya hay sesión activa, redirige al dashboard
    if (this.auth.loggedIn()) {
      console.log("redirigir a dashboard");

      if(this.auth.role() === 'CLIENTE') {
        await this.router.navigateByUrl('/dashboard');
      }

      if(this.auth.role() === 'ADMIN') {
        await this.router.navigateByUrl('/dashboard-admin');
      }

    }
  }
}
