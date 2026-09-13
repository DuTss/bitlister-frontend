import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListingCreate } from './listing-create';

describe('ListingCreate', () => {
  let component: ListingCreate;
  let fixture: ComponentFixture<ListingCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListingCreate],
    }).compileComponents();

    fixture = TestBed.createComponent(ListingCreate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
