import { Component, ViewChild, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { SplashComponent } from './components/splash/splash.component';
import { TutorialComponent } from './components/tutorial/tutorial.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, RouterOutlet, RouterLink, RouterLinkActive,
    MatToolbarModule, MatSidenavModule, MatListModule,
    MatIconModule, MatButtonModule, SplashComponent, TutorialComponent
  ],
  template: `
    <app-splash *ngIf="showSplash()" (finished)="onSplashFinished()"></app-splash>

    <app-tutorial *ngIf="showTutorial()" (finished)="onTutorialFinished()"></app-tutorial>

    <mat-sidenav-container class="sidenav-container" *ngIf="!showSplash() && !showTutorial()">
      <mat-sidenav #drawer class="sidenav" fixedInViewport
          [attr.role]="'navigation'"
          [mode]="isHandset ? 'over' : 'side'"
          [opened]="!isHandset">
        <mat-toolbar>Menu</mat-toolbar>
        <mat-nav-list>
          <a mat-list-item routerLink="/order-form" routerLinkActive="active-link" (click)="closeSidenavIfHandset()">
            <mat-icon matListItemIcon>receipt</mat-icon>
            <span matListItemTitle>Novo Pedido</span>
          </a>
          <a mat-list-item routerLink="/suppliers" routerLinkActive="active-link" (click)="closeSidenavIfHandset()">
            <mat-icon matListItemIcon>business</mat-icon>
            <span matListItemTitle>Fornecedores</span>
          </a>
          <a mat-list-item routerLink="/customers" routerLinkActive="active-link" (click)="closeSidenavIfHandset()">
            <mat-icon matListItemIcon>people</mat-icon>
            <span matListItemTitle>Clientes</span>
          </a>
          <a mat-list-item routerLink="/carriers" routerLinkActive="active-link" (click)="closeSidenavIfHandset()">
            <mat-icon matListItemIcon>local_shipping</mat-icon>
            <span matListItemTitle>Transportadoras</span>
          </a>
          <a mat-list-item routerLink="/history" routerLinkActive="active-link" (click)="closeSidenavIfHandset()">
            <mat-icon matListItemIcon>history</mat-icon>
            <span matListItemTitle>Histórico</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>
      <mat-sidenav-content>
        <mat-toolbar color="primary">
          <button mat-icon-button *ngIf="isHandset" (click)="drawer.toggle()" aria-label="Toggle menu">
            <mat-icon>menu</mat-icon>
          </button>
          <span>Marcann - Pedidos</span>
        </mat-toolbar>
        <div class="content">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: `
    .sidenav-container { height: 100vh; }
    .sidenav { width: 250px; border-right: 1px solid rgba(0,0,0,0.12); }
    .sidenav .mat-toolbar { background: inherit; }
    .mat-toolbar.mat-primary { position: sticky; top: 0; z-index: 1; display: flex; gap: 10px; }
    .content { padding: 20px; }
    .active-link { background: rgba(63, 81, 181, 0.1); border-right: 4px solid #3f51b5; }
    
    @media (max-width: 768px) {
      .content { padding: 10px; }
    }
  `
})
export class App {
  @ViewChild('drawer') drawer!: MatSidenav;
  private breakpointObserver = inject(BreakpointObserver);
  isHandset = false;
  showSplash = signal(true);
  showTutorial = signal(false);

  constructor() {
    this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.Tablet])
      .subscribe(result => {
        this.isHandset = result.matches;
      });
  }

  onSplashFinished() {
    this.showSplash.set(false);
    // Mostrar tutorial após o splash
    this.showTutorial.set(true);
  }

  onTutorialFinished() {
    this.showTutorial.set(false);
  }

  closeSidenavIfHandset() {
    if (this.isHandset && this.drawer) {
      this.drawer.close();
    }
  }
}

