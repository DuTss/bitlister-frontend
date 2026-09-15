import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetupModal } from './meetup-modal';

describe('MeetupModal', () => {
  let component: MeetupModal;
  let fixture: ComponentFixture<MeetupModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeetupModal],
    }).compileComponents();

    fixture = TestBed.createComponent(MeetupModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
