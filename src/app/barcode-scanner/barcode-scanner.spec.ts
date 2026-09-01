import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BarcodeScanner } from './barcode-scanner';

describe('BarcodeScanner', () => {
  let component: BarcodeScanner;
  let fixture: ComponentFixture<BarcodeScanner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarcodeScanner],
    }).compileComponents();

    fixture = TestBed.createComponent(BarcodeScanner);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
