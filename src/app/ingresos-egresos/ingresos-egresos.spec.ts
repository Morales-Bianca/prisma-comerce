import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IngresosEgresos } from './ingresos-egresos';

describe('IngresosEgresos', () => {
  let component: IngresosEgresos;
  let fixture: ComponentFixture<IngresosEgresos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IngresosEgresos],
    }).compileComponents();

    fixture = TestBed.createComponent(IngresosEgresos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
