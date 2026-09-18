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
import { ResetPassword } from './features/auth/reset-password/reset-password';
import { ForgotPassword } from './features/auth/forgot-password/forgot-password';
import { VerifyEmail } from './features/auth/verify-email/verify-email';
import { NotFound } from './pages/not-found/not-found';
import { Terms } from './pages/terms/terms';
import { Privacy } from './pages/privacy/privacy';
import { About } from './pages/about/about';
import { Chat } from './features/chat/chat';
import { ChatList } from './features/chat-list/chat-list';


export const routes: Routes = [
  { path: '', component: ListingList },
  { path: 'my-listings', component: MyListings, canActivate: [authGuard] },
  { path: 'create-listing', component: ListingCreate, canActivate: [authGuard] },
  { path: 'listings/:id/edit', component: ListingEdit, canActivate: [authGuard] },
  { path: 'listings/:id', component: ListingDetail },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'verify-email', component: VerifyEmail },
  { path: 'reset-password', component: ResetPassword },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'terms', component: Terms },
  { path: 'privacy', component: Privacy },
  { path: 'about', component: About },
  { path: 'profile', component: Profile, canActivate: [authGuard] },
  { path: 'favorites',component: FavoritesList, canActivate: [authGuard] },
  { path: 'messages', component: ChatList, canActivate: [authGuard] },
  { path: 'chat/:roomId', component: Chat, canActivate: [authGuard] },
  { path: 'chat', component: Chat, canActivate: [authGuard]},
  { path: '**', component: NotFound }
  // { path: '**', redirectTo: '' }
];
