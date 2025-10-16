import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservasFormComponent } from './reservas-form.component';

describe('ReservasFormComponent', () => {
  let component: ReservasFormComponent;
  let fixture: ComponentFixture<ReservasFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservasFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReservasFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
