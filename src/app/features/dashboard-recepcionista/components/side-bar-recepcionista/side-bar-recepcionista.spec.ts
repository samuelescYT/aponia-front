import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SideBarRecepcionista } from './side-bar-recepcionista';

describe('SideBarRecepcionista', () => {
  let component: SideBarRecepcionista;
  let fixture: ComponentFixture<SideBarRecepcionista>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SideBarRecepcionista]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SideBarRecepcionista);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
