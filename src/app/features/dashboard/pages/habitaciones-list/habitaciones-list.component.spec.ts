import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HabitacionesListComponent } from './habitaciones-list.component';

describe('HabitacionesListComponent', () => {
  let component: HabitacionesListComponent;
  let fixture: ComponentFixture<HabitacionesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HabitacionesListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HabitacionesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
