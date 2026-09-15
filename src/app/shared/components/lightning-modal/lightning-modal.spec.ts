import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LightningModalComponent } from './lightning-modal';

describe('LightningModal', () => {
  let component: LightningModalComponent;
  let fixture: ComponentFixture<LightningModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LightningModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LightningModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
