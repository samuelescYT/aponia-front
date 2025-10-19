import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeRecepcionista } from './home-recepcionista';

describe('HomeRecepcionista', () => {
  let component: HomeRecepcionista;
  let fixture: ComponentFixture<HomeRecepcionista>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeRecepcionista]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeRecepcionista);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
