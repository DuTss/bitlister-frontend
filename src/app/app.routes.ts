import { Routes } from '@angular/router';
import { ListingList } from './features/listings/listing-list/listing-list';
import { ListingDetail } from './features/listings/listing-detail/listing-detail';
import { ListingCreate } from './features/listings/listing-create/listing-create';
import { ListingEdit } from './features/listings/listing-edit/listing-edit';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', component: ListingList },
  { path: 'create-listing', component: ListingCreate, canActivate: [authGuard] },
  { path: 'listings/:id/edit', component: ListingEdit, canActivate: [authGuard] },
  { path: 'listings/:id', component: ListingDetail },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: '**', redirectTo: '' }
];
