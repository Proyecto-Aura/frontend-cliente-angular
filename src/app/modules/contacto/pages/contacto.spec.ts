import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Contacto } from './contacto';

describe('Contacto', () => {
  let fixture: ComponentFixture<Contacto>;

  const raiz = () => fixture.nativeElement as HTMLElement;
  const texto = () => raiz().textContent ?? '';
  const enlace = (parte: string) => raiz().querySelector<HTMLAnchorElement>(`a[href*="${parte}"]`);

  beforeEach(() => {
    fixture = TestBed.createComponent(Contacto);
    fixture.detectChanges();
  });

  it('has no message form (contact goes through the company channels)', () => {
    expect(raiz().querySelector('form')).toBeNull();
    expect(raiz().querySelector('textarea')).toBeNull();
  });

  it('shows the three channels and the location', () => {
    const titulos = Array.from(raiz().querySelectorAll('h2')).map((h) => h.textContent?.trim());
    expect(titulos).toEqual(['Llámanos', 'Escríbenos', 'Síguenos', 'Nuestra ubicación']);
    expect(texto()).toContain('San Juan de Lurigancho');
  });

  it('links the phone and both emails', () => {
    expect(enlace('tel:+5113881888')?.textContent).toContain('(01) 388-1888');
    expect(enlace('mailto:info@snacksfrancos.com')).not.toBeNull();
    expect(enlace('mailto:snacks_francos@hotmail.com')).not.toBeNull();
  });

  it('opens the map in a new tab without exposing the page', () => {
    const mapa = enlace('google.com/maps')!;
    expect(mapa.target).toBe('_blank');
    expect(mapa.rel).toContain('noopener');
  });

  it('embeds the Google Maps place without an API key, lazily and with an accessible title', () => {
    const mapa = raiz().querySelector<HTMLIFrameElement>('iframe')!;
    expect(mapa.getAttribute('src')).toMatch(/^https:\/\/www\.google\.com\/maps\/embed\?pb=/);
    expect(mapa.getAttribute('src')).not.toContain('key=');
    expect(mapa.getAttribute('loading')).toBe('lazy');
    expect(mapa.title).toContain('Industrias Alimentarias Vera');
  });

  it('shows channels without a real URL yet as plain text, not as dead links', () => {
    expect(texto()).toContain('WhatsApp');
    expect(texto()).toContain('Facebook');
    const sinDestino = Array.from(raiz().querySelectorAll('a')).filter(
      (a) => !a.getAttribute('href'),
    );
    expect(sinDestino).toEqual([]);
  });

  it('labels each channel section by its heading', () => {
    raiz()
      .querySelectorAll('section[aria-labelledby]')
      .forEach((seccion) => {
        const id = seccion.getAttribute('aria-labelledby')!;
        expect(raiz().querySelector(`#${id}`)).not.toBeNull();
      });
  });
});
