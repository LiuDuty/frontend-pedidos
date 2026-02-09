import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OrderFormComponent } from './components/order-form/order-form.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, OrderFormComponent],
  template: `
    <app-order-form></app-order-form>
    <router-outlet></router-outlet>
  `,
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend-pedidos');
}
