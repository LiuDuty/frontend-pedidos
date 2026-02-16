import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-splash',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="splash-screen" [class.fade-out]="isFadingOut">
      <!-- Background Abstract Shapes -->
      <div class="bg-glow"></div>
      <div class="mesh-gradient"></div>
      
      <div class="splash-content">
        <div class="main-visual">
          <div class="glass-card">
            <div class="icon-wrapper">
              <svg viewBox="0 0 100 100" class="invoice-svg">
                <rect class="doc-body" x="20" y="10" width="60" height="80" rx="8" fill="white" />
                <path class="doc-lines" d="M35 35h30M35 50h30M35 65h20" stroke="#6366f1" stroke-width="4" stroke-linecap="round" />
                <circle class="doc-check" cx="75" cy="20" r="15" fill="#10b981" />
                <path class="check-mark" d="M68 20l5 5 9-9" stroke="white" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
          </div>
          
          <div class="text-group">
            <h1 class="brand-name">
              <span class="m">M</span>arcann
            </h1>
            <div class="divider"></div>
            <p class="tagline">Smart Invoicing & Order Management</p>
          </div>
        </div>

        <div class="loading-system">
          <div class="status-text">{{loadingText}}</div>
          <div class="modern-loader">
            <div class="loader-bar"></div>
          </div>
        </div>
      </div>
      
      <div class="footer-note">Premium Business Experience</div>
    </div>
  `,
  styles: [`
    :host {
      --primary: #6366f1;
      --secondary: #a855f7;
      --accent: #10b981;
      --dark: #0f172a;
    }

    .splash-screen {
      position: fixed;
      inset: 0;
      background: var(--dark);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      overflow: hidden;
      transition: all 0.8s cubic-bezier(0.65, 0, 0.35, 1);
    }

    .splash-screen.fade-out {
      opacity: 0;
      transform: scale(1.1);
      pointer-events: none;
    }

    /* Modern Background */
    .bg-glow {
      position: absolute;
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0) 70%);
      filter: blur(80px);
      animation: pulseGlow 4s infinite alternate;
    }

    .mesh-gradient {
      position: absolute;
      inset: 0;
      background-image: 
        radial-gradient(at 0% 0%, rgba(168, 85, 247, 0.1) 0, transparent 50%),
        radial-gradient(at 100% 100%, rgba(99, 102, 241, 0.1) 0, transparent 50%);
      opacity: 0.5;
    }

    .splash-content {
      position: relative;
      z-index: 1;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 40px;
    }

    .main-visual {
      animation: zoomIn 1s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    /* Glassmorphism Icon */
    .glass-card {
      width: 140px;
      height: 140px;
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 32px;
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 0 auto 30px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
      position: relative;
    }

    .icon-wrapper {
      width: 80px;
      height: 80px;
    }

    .invoice-svg {
      width: 100%;
      height: 100%;
      filter: drop-shadow(0 0 10px rgba(99, 102, 241, 0.5));
    }

    .doc-body {
      animation: docFloat 3s infinite ease-in-out;
    }

    .doc-lines {
      stroke-dasharray: 50;
      stroke-dashoffset: 50;
      animation: drawLines 2s forwards 0.5s;
    }

    .doc-check {
      transform-origin: center;
      scale: 0;
      animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards 1.2s;
    }

    /* Typography */
    .text-group {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .brand-name {
      font-size: 5rem;
      font-weight: 900;
      color: white;
      margin: 0;
      letter-spacing: -3px;
      line-height: 1;
      display: flex;
      align-items: baseline;
    }

    .brand-name .m {
      background: linear-gradient(135deg, #6366f1, #a855f7);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-right: 2px;
    }

    .divider {
      width: 40px;
      height: 4px;
      background: var(--primary);
      border-radius: 2px;
      margin: 15px 0;
      animation: expandDivider 1s forwards 0.3s;
      transform: scaleX(0);
    }

    .tagline {
      color: #94a3b8;
      font-size: 1.1rem;
      font-weight: 300;
      letter-spacing: 4px;
      text-transform: uppercase;
      margin: 0;
      opacity: 0;
      animation: fadeIn 1s forwards 0.8s;
    }

    /* Loading System */
    .loading-system {
      margin-top: 20px;
      width: 240px;
    }

    .status-text {
      color: #64748b;
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 12px;
      font-weight: 500;
    }

    .modern-loader {
      height: 2px;
      width: 100%;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 4px;
      position: relative;
      overflow: hidden;
    }

    .loader-bar {
      position: absolute;
      height: 100%;
      width: 0%;
      background: linear-gradient(to right, transparent, var(--primary), var(--secondary));
      animation: loadProgress 2.5s cubic-bezier(0.65, 0, 0.35, 1) forwards;
    }

    .footer-note {
      position: absolute;
      bottom: 40px;
      color: #475569;
      font-size: 0.75rem;
      letter-spacing: 3px;
      text-transform: uppercase;
    }

    /* Animations */
    @keyframes pulseGlow {
      from { transform: scale(1); opacity: 0.15; }
      to { transform: scale(1.2); opacity: 0.25; }
    }

    @keyframes zoomIn {
      from { opacity: 0; transform: scale(0.8); }
      to { opacity: 1; transform: scale(1); }
    }

    @keyframes docFloat {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-8px) rotate(2deg); }
    }

    @keyframes drawLines {
      to { stroke-dashoffset: 0; }
    }

    @keyframes scaleIn {
      to { scale: 1; }
    }

    @keyframes expandDivider {
      to { transform: scaleX(1); }
    }

    @keyframes loadProgress {
      0% { width: 0%; left: 0; }
      50% { width: 70%; left: 0; }
      100% { width: 100%; left: 0; }
    }

    @keyframes fadeIn {
      to { opacity: 1; }
    }

    /* Mobile Adaptations */
    @media (max-width: 600px) {
      .brand-name { font-size: 3.5rem; letter-spacing: -2px; }
      .glass-card { width: 110px; height: 110px; border-radius: 24px; }
      .icon-wrapper { width: 60px; height: 60px; }
      .tagline { font-size: 0.8rem; letter-spacing: 2px; }
      .footer-note { bottom: 20px; font-size: 0.6rem; }
    }
  `]
})
export class SplashComponent implements OnInit {
  @Output() finished = new EventEmitter<void>();
  isFadingOut = false;
  loadingText = 'Initializing Engine';

  ngOnInit() {
    const statuses = ['Initializing Engine', 'Loading Assets', 'Syncing Data', 'Ready'];
    let i = 0;
    const interval = setInterval(() => {
      if (i < statuses.length - 1) {
        this.loadingText = statuses[i++];
      } else {
        clearInterval(interval);
      }
    }, 700);

    setTimeout(() => {
      this.isFadingOut = true;
      setTimeout(() => {
        this.finished.emit();
      }, 850);
    }, 3200);
  }
}
