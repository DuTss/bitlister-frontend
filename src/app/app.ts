import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
// import { Header } from './shared/components/header/header';
import { Footer } from './shared/components/footer/footer';
import { Navbar } from './shared/components/navbar/navbar'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Footer, Navbar], //Header
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
