import { Routes } from '@angular/router';
import { ListingList } from './features/listings/listing-list/listing-list';

export const routes: Routes = [
  { path: '', component: ListingList },
  { path: '**', redirectTo: '' }
];
