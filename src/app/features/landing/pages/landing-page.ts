import { StepsComponent } from './../components/steps/steps';
import { FooterComponent } from './../components/footer/footer';
import { CtaFinalComponent } from './../components/cta-final/cta-final';
import { TestimonialsComponent } from './../components/testimonials/testimonials';
import { ExperiencesCarouselComponent } from './../components/experiences-carousel/experiences-carousel';
import { ServicesComponent } from './../components/services/services';
import { RoomsGridComponent } from './../components/rooms-grid/rooms-grid';
import { Component } from '@angular/core';
import { HeaderComponent } from '../components/header/header';
import { HeroComponent } from '../components/hero/hero';
import { AboutComponent } from '../components/about/about';

@Component({
  selector: 'app-landing-page',
  imports: [
    HeaderComponent, HeroComponent, AboutComponent, RoomsGridComponent,
    ServicesComponent, ExperiencesCarouselComponent, TestimonialsComponent,
    StepsComponent, CtaFinalComponent, FooterComponent
  ],
  templateUrl: './landing-page.html',
})
export class LandingPageComponent {}
