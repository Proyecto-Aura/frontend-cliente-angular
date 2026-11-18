import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Alert, AlertTone } from './alert';

@Component({
  selector: 'app-alert-anfitrion',
  imports: [Alert],
  template: `
    <app-alert
      [tone]="tone"
      [title]="title"
      [description]="description"
      [linkLabel]="linkLabel"
      [closable]="closable"
      (closed)="cerrados = cerrados + 1"
      (linkClick)="clicsEnlace = clicsEnlace + 1"
    >
      @if (conProyectado) {
        <a href="/destino">Ir</a>
      }
    </app-alert>
  `,
})
class AlertAnfitriona {
  tone: AlertTone = 'info';
  title = 'Título de la alerta';
  description: string | null = null;
  linkLabel: string | null = null;
  closable = true;
  conProyectado = false;
  cerrados = 0;
  clicsEnlace = 0;
}

describe('Alert (app-alert)', () => {
  let fixture: ComponentFixture<AlertAnfitriona>;

  const raiz = () => fixture.nativeElement as HTMLElement;
  const caja = () => raiz().querySelector('app-alert')!;
  const texto = () => raiz().textContent ?? '';

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [AlertAnfitriona] });
    fixture = TestBed.createComponent(AlertAnfitriona);
    fixture.detectChanges();
  });

  it('shows the tone label, the bold title and, when there is one, the description', () => {
    fixture.componentInstance.description = 'Detalle de la alerta';
    fixture.detectChanges();

    expect(texto()).toContain('Información');
    expect(texto()).toContain('Título de la alerta');
    expect(texto()).toContain('Detalle de la alerta');
  });

  it('does not render a description when there is none', () => {
    expect(texto()).not.toContain('null');
    expect(raiz().querySelectorAll('p')).toHaveLength(2); // etiqueta + título
  });

  it.each<[AlertTone, string, string]>([
    ['success', 'bg-success-50', 'Éxito'],
    ['error', 'bg-danger-50', 'Error'],
    ['warning', 'bg-warning-50', 'Advertencia'],
    ['info', 'bg-info-50', 'Información'],
  ])('uses the solid background and label for tone "%s"', (tone, claseFondo, etiqueta) => {
    fixture.componentInstance.tone = tone;
    fixture.detectChanges();

    expect(caja().className).toContain(claseFondo);
    expect(texto()).toContain(etiqueta);
  });

  it('is role="alert" only for the error tone; the rest are role="status"', () => {
    expect(caja().getAttribute('role')).toBe('status');

    fixture.componentInstance.tone = 'error';
    fixture.detectChanges();

    expect(caja().getAttribute('role')).toBe('alert');
  });

  it('shows a close button by default and emits "closed" when clicked', () => {
    const boton = raiz().querySelector<HTMLButtonElement>('button[aria-label="Cerrar alerta"]');
    expect(boton).not.toBeNull();

    boton!.click();

    expect(fixture.componentInstance.cerrados).toBe(1);
  });

  it('hides the close button when closable is false', () => {
    fixture.componentInstance.closable = false;
    fixture.detectChanges();

    expect(raiz().querySelector('button[aria-label="Cerrar alerta"]')).toBeNull();
  });

  it('shows the link only when linkLabel is set, and emits "linkClick" when clicked', () => {
    expect(texto()).not.toContain('→');

    fixture.componentInstance.linkLabel = 'Ver más';
    fixture.detectChanges();
    const boton = Array.from(raiz().querySelectorAll('button')).find((b) =>
      b.textContent!.includes('Ver más'),
    )!;
    boton.click();

    expect(fixture.componentInstance.clicsEnlace).toBe(1);
  });

  it('projects extra content, like a link, inside the alert', () => {
    fixture.componentInstance.conProyectado = true;
    fixture.detectChanges();

    expect(caja().querySelector('a')?.getAttribute('href')).toBe('/destino');
  });
});
