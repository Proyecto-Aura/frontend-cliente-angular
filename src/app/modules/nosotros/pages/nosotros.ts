import { Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

/** Página institucional "Nosotros" (contenido estático). Hija de store-layout. */
@Component({
  selector: 'app-nosotros',
  imports: [NgOptimizedImage],
  host: { class: 'block' },
  templateUrl: './nosotros.html',
})
export class Nosotros {
  protected readonly valores = [
    {
      icon: '🌿',
      title: '100% Natural',
      desc: 'Sin conservantes ni colorantes artificiales. Solo ingredientes de la tierra peruana.',
    },
    {
      icon: '🤝',
      title: 'Comercio justo',
      desc: 'Trabajamos directamente con agricultores de las regiones de Piura, Lambayeque y Lima.',
    },
    {
      icon: '✨',
      title: 'Calidad artesanal',
      desc: 'Cada lote es elaborado con técnicas tradicionales y control de calidad riguroso.',
    },
  ];

  protected readonly stats = [
    { val: '14+', label: 'Años de experiencia' },
    { val: '50+', label: 'Agricultores aliados' },
    { val: '20+', label: 'Variedades de snacks' },
    { val: '10K+', label: 'Clientes satisfechos' },
  ];

  protected readonly equipo = [
    { initials: 'FF', name: 'Franco Flores', role: 'Fundador & CEO', tone: 'bg-[#fce4e4] text-brand-600' },
    { initials: 'MR', name: 'María Ramos', role: 'Directora de Calidad', tone: 'bg-[#fef0dc] text-[#b45309]' },
    { initials: 'CP', name: 'Carlos Paz', role: 'Jefe de Producción', tone: 'bg-[#e2f3e6] text-success-700' },
    { initials: 'LT', name: 'Lucía Torres', role: 'Gerente Comercial', tone: 'bg-[#e6e7fb] text-[#4f46e5]' },
  ];
}
