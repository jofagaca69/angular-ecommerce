import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NumericKeypad } from './numeric-keypad';

describe('NumericKeypad', () => {
  let component: NumericKeypad;
  let fixture: ComponentFixture<NumericKeypad>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NumericKeypad]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NumericKeypad);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
