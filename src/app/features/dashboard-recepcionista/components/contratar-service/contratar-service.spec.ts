import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContratarService } from './contratar-service';

describe('ContratarService', () => {
  let component: ContratarService;
  let fixture: ComponentFixture<ContratarService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContratarService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContratarService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
