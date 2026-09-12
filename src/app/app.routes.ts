import { Routes } from '@angular/router';
import { ListingList } from './features/listings/listing-list/listing-list';
import { Register } from './features/auth/register/register';
import { Login } from './features/auth/login/login';

export const routes: Routes = [
  { path: '', component: ListingList },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: '**', redirectTo: '' }
];
