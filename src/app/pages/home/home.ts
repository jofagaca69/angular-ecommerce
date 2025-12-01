import { Component } from '@angular/core';
import {Navbar} from '../../components/navbar/navbar';
import {CommonModule, CurrencyPipe} from '@angular/common';
import {Rating} from 'primeng/rating';
import {Carousel} from 'primeng/carousel';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-home',
  imports: [Navbar, FormsModule, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  products = [
    {
      name: 'Glucosamina + Colágeno',
      price: 45000,
      img: '/assets/prod-glucosamina.jpg',
      rating: 4.5,
    },
    {
      name: 'Multivitamínico 50+',
      price: 38900,
      img: '/assets/prod-multivitaminico.jpg',
      rating: 5,
    },
    {
      name: 'Omega 3 Premium',
      price: 52000,
      img: '/assets/prod-omega3.jpg',
      rating: 4,
    },
    {
      name: 'Calcio + Vitamina D',
      price: 31000,
      img: '/assets/prod-calcio.jpg',
      rating: 4.5,
    }
  ];
}
