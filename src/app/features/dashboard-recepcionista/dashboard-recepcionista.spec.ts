import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardRecepcionista } from './dashboard-recepcionista';

describe('DashboardRecepcionista', () => {
  let component: DashboardRecepcionista;
  let fixture: ComponentFixture<DashboardRecepcionista>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardRecepcionista]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardRecepcionista);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
