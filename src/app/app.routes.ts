import { Routes } from '@angular/router';
import { ListingList } from './features/listings/listing-list/listing-list';
import { MyListings } from './features/listings/my-listings/my-listings';
import { ListingDetail } from './features/listings/listing-detail/listing-detail';
import { ListingCreate } from './features/listings/listing-create/listing-create';
import { ListingEdit } from './features/listings/listing-edit/listing-edit';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { Profile } from './features/profile/profile/profile';
import { authGuard } from './core/guards/auth.guard';
import { FavoritesList } from './features/favorites/favorites-list/favorites-list';

export const routes: Routes = [
  { path: '', component: ListingList },
  { path: 'my-listings', component: MyListings, canActivate: [authGuard] },
  { path: 'create-listing', component: ListingCreate, canActivate: [authGuard] },
  { path: 'listings/:id/edit', component: ListingEdit, canActivate: [authGuard] },
  { path: 'listings/:id', component: ListingDetail },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'profile', component: Profile, canActivate: [authGuard] },
  { path: 'favorites',component: FavoritesList, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
