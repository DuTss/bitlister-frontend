import { User } from './user.model';

export interface Listing {
  _id: string;
  title: string;
  description: string;
  priceInSats: number;
  category: 'Hardware' | 'Livres' | 'Informatique' | 'Services' | 'Divers';
  location: string;
  seller?: User;
  status?: 'ACTIVE' | 'RESERVED' | 'SOLD';
  createdAt?: string;
}
