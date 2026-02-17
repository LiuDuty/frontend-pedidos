import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
    selector: 'app-tutorial',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatIconModule, MatCardModule],
    template: `
    <div class="tutorial-overlay" [@fadeIn]>
      <div class="tutorial-container">
        <div class="tutorial-card">
          <div class="tutorial-header">
            <mat-icon class="tutorial-icon">school</mat-icon>
            <h2>Bem-vindo ao Marcann Pedidos!</h2>
            <p>Aprenda a usar o sistema em poucos passos</p>
          </div>

          <div class="tutorial-content">
            <div class="tutorial-step" *ngFor="let step of steps; let i = index" 
                 [class.active]="currentStep() === i">
              <div class="step-number">{{ i + 1 }}</div>
              <div class="step-content">
                <mat-icon class="step-icon">{{ step.icon }}</mat-icon>
                <h3>{{ step.title }}</h3>
                <p>{{ step.description }}</p>
              </div>
            </div>
          </div>

          <div class="tutorial-navigation">
            <button mat-button (click)="skip()" class="skip-btn">
              Pular Tutorial
            </button>
            <div class="nav-buttons">
              <button mat-button (click)="previous()" 
                      [disabled]="currentStep() === 0">
                <mat-icon>arrow_back</mat-icon>
                Anterior
              </button>
              <div class="step-indicator">
                <span *ngFor="let step of steps; let i = index" 
                      class="dot" 
                      [class.active]="currentStep() === i"></span>
              </div>
              <button mat-raised-button color="primary" (click)="next()">
                {{ currentStep() === steps.length - 1 ? 'Começar' : 'Próximo' }}
                <mat-icon>{{ currentStep() === steps.length - 1 ? 'check' : 'arrow_forward' }}</mat-icon>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .tutorial-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(63, 81, 181, 0.95), rgba(103, 58, 183, 0.95));
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      padding: 20px;
      animation: fadeIn 0.3s ease-in;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .tutorial-container {
      max-width: 700px;
      width: 100%;
      animation: slideUp 0.4s ease-out;
    }

    @keyframes slideUp {
      from { 
        opacity: 0;
        transform: translateY(30px);
      }
      to { 
        opacity: 1;
        transform: translateY(0);
      }
    }

    .tutorial-card {
      background: white;
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    .tutorial-header {
      text-align: center;
      margin-bottom: 40px;
    }

    .tutorial-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #3f51b5;
      margin-bottom: 16px;
    }

    .tutorial-header h2 {
      margin: 0 0 8px 0;
      font-size: 28px;
      color: #333;
      font-weight: 600;
    }

    .tutorial-header p {
      margin: 0;
      color: #666;
      font-size: 16px;
    }

    .tutorial-content {
      min-height: 280px;
      position: relative;
    }

    .tutorial-step {
      display: none;
      animation: fadeInStep 0.3s ease-in;
    }

    .tutorial-step.active {
      display: flex;
      gap: 20px;
      align-items: flex-start;
    }

    @keyframes fadeInStep {
      from { opacity: 0; transform: translateX(20px); }
      to { opacity: 1; transform: translateX(0); }
    }

    .step-number {
      flex-shrink: 0;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3f51b5, #673ab7);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(63, 81, 181, 0.3);
    }

    .step-content {
      flex: 1;
    }

    .step-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #3f51b5;
      margin-bottom: 16px;
    }

    .step-content h3 {
      margin: 0 0 12px 0;
      font-size: 22px;
      color: #333;
      font-weight: 600;
    }

    .step-content p {
      margin: 0;
      color: #666;
      font-size: 16px;
      line-height: 1.6;
    }

    .tutorial-navigation {
      margin-top: 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 30px;
      border-top: 1px solid #e0e0e0;
    }

    .skip-btn {
      color: #999;
    }

    .nav-buttons {
      display: flex;
      gap: 16px;
      align-items: center;
    }

    .step-indicator {
      display: flex;
      gap: 8px;
    }

    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #ddd;
      transition: all 0.3s ease;
    }

    .dot.active {
      background: #3f51b5;
      width: 24px;
      border-radius: 5px;
    }

    button mat-icon {
      margin-left: 4px;
    }

    button:first-child mat-icon {
      margin-left: 0;
      margin-right: 4px;
    }

    @media (max-width: 768px) {
      .tutorial-card {
        padding: 24px;
      }

      .tutorial-header h2 {
        font-size: 24px;
      }

      .tutorial-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
      }

      .step-content h3 {
        font-size: 18px;
      }

      .step-content p {
        font-size: 14px;
      }

      .tutorial-navigation {
        flex-direction: column;
        gap: 16px;
      }

      .nav-buttons {
        width: 100%;
        justify-content: space-between;
      }

      .skip-btn {
        order: 2;
      }
    }
  `]
})
export class TutorialComponent {
    @Output() finished = new EventEmitter<void>();

    currentStep = signal(0);

    steps = [
        {
            icon: 'receipt',
            title: 'Criar Pedidos',
            description: 'Acesse "Novo Pedido" no menu para criar pedidos de forma rápida. Preencha os dados do fornecedor, cliente, produtos e transportadora.'
        },
        {
            icon: 'business',
            title: 'Gerenciar Fornecedores e Clientes',
            description: 'Cadastre e gerencie seus fornecedores, clientes e transportadoras nas respectivas seções do menu. Todos os dados ficam salvos na nuvem.'
        },
        {
            icon: 'picture_as_pdf',
            title: 'Gerar PDFs',
            description: 'Após criar um pedido, você pode visualizar, baixar ou compartilhar o PDF diretamente do sistema. Ideal para enviar por WhatsApp ou email!'
        },
        {
            icon: 'history',
            title: 'Consultar Histórico',
            description: 'Acesse o histórico para ver todos os pedidos anteriores, pesquisar por número de nota e visualizar ou compartilhar PDFs novamente.'
        },
        {
            icon: 'cloud_done',
            title: 'Tudo na Nuvem',
            description: 'Seus dados estão seguros e sincronizados na nuvem. Acesse de qualquer dispositivo, a qualquer momento!'
        }
    ];

    next() {
        if (this.currentStep() < this.steps.length - 1) {
            this.currentStep.update(v => v + 1);
        } else {
            this.finish();
        }
    }

    previous() {
        if (this.currentStep() > 0) {
            this.currentStep.update(v => v - 1);
        }
    }

    skip() {
        this.finish();
    }

    finish() {
        this.finished.emit();
    }
}
