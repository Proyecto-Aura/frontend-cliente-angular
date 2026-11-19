import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { catchError, of, switchMap, tap } from 'rxjs';

import { Alert } from '../../../../shared/ui/alert/alert';
import { Avisos } from '../../../../shared/ui/aviso/aviso';
import { Icon } from '../../../../shared/ui/icon/icon';
import { apiErrorMessage } from '../../../../shared/utils/api-error';
import { ActualizarPerfil, PerfilCliente, UbigeoItem } from '../../models/perfil.model';
import { PerfilStore } from '../../services/perfil-store';
import { UbigeoApi } from '../../services/ubigeo-api';

/** Mismo máximo que valida el backend para la dirección. */
export const DIRECCION_MAXIMA = 255;

/** Rechaza un texto de solo espacios. */
function noVacia(control: AbstractControl<string>): ValidationErrors | null {
  return control.value.trim() ? null : { required: true };
}

type Campo = 'direccion' | 'departamento_id' | 'provincia_id' | 'distrito_id';

const MENSAJES_REQUERIDO: Record<Campo, string> = {
  direccion: 'Ingresa tu dirección de entrega',
  departamento_id: 'Selecciona tu departamento',
  provincia_id: 'Selecciona tu provincia',
  distrito_id: 'Selecciona tu distrito',
};

/**
 * HU-B-018 (RF-B46): el cliente actualiza su dirección de entrega predeterminada
 * (dirección + departamento, provincia y distrito). El checkout la propone en
 * sus próximos pedidos.
 */
@Component({
  selector: 'app-cuenta-direccion-card',
  imports: [ReactiveFormsModule, Icon, Alert],
  templateUrl: './cuenta-direccion-card.html',
})
export class CuentaDireccionCard {
  private readonly store = inject(PerfilStore);
  private readonly ubigeo = inject(UbigeoApi);
  private readonly avisos = inject(Avisos);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly direccionMaxima = DIRECCION_MAXIMA;

  protected readonly form = new FormGroup({
    direccion: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(DIRECCION_MAXIMA), noVacia],
    }),
    departamento_id: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    provincia_id: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    distrito_id: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  protected readonly departamentos = signal<UbigeoItem[]>([]);
  protected readonly provincias = signal<UbigeoItem[]>([]);
  protected readonly distritos = signal<UbigeoItem[]>([]);
  protected readonly errorCatalogo = signal<string | null>(null);

  protected readonly guardando = signal(false);

  private original: PerfilCliente | null = null;

  constructor() {
    this.ubigeo
      .departamentos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (lista) => this.departamentos.set(lista),
        error: (err: unknown) => this.errorCatalogo.set(this.mensajeCatalogo(err)),
      });

    // Cascada: al cambiar un nivel se vacían los de abajo y se cargan sus opciones.
    const { departamento_id, provincia_id, distrito_id } = this.form.controls;
    departamento_id.valueChanges
      .pipe(
        tap(() => {
          this.provincias.set([]);
          this.distritos.set([]);
          provincia_id.setValue('');
        }),
        switchMap((id) => this.cargarLista(id, (v) => this.ubigeo.provincias(v))),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((lista) => this.provincias.set(lista));
    provincia_id.valueChanges
      .pipe(
        tap(() => {
          this.distritos.set([]);
          distrito_id.setValue('');
        }),
        switchMap((id) => this.cargarLista(id, (v) => this.ubigeo.distritos(v))),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((lista) => this.distritos.set(lista));

    this.llenar(this.store.perfil(), true);
  }

  protected descartar(): void {
    this.llenar(this.original, true);
  }

  protected guardar(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.guardando()) return;

    const cambios = this.cambios();
    if (!cambios.direccion && !cambios.distrito_id) {
      this.form.markAsPristine();
      return;
    }
    this.guardando.set(true);
    this.store
      .actualizar(cambios)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (perfil) => {
          this.guardando.set(false);
          // Las listas ya tienen la selección: solo se actualiza el formulario.
          this.llenar(perfil, false);
          this.avisos.mostrar(
            'Tu dirección de entrega se guardó',
            'La usaremos en tus próximos pedidos.',
            'success',
          );
        },
        error: (err: unknown) => {
          this.guardando.set(false);
          this.avisos.mostrar(
            apiErrorMessage(err, 'No pudimos guardar tu dirección. Inténtalo de nuevo.'),
            undefined,
            'error',
          );
        },
      });
  }

  /** Mensaje del campo si ya se tocó y no es válido. */
  protected error(campo: Campo): string | null {
    const control = this.form.controls[campo];
    if (!control.touched || control.valid) return null;
    if (control.hasError('maxlength')) {
      return `La dirección no puede pasar de ${DIRECCION_MAXIMA} caracteres`;
    }
    return MENSAJES_REQUERIDO[campo];
  }

  private cargarLista(id: string, pedir: (id: string) => ReturnType<UbigeoApi['provincias']>) {
    if (!id) return of<UbigeoItem[]>([]);
    return pedir(id).pipe(
      catchError((err: unknown) => {
        this.errorCatalogo.set(this.mensajeCatalogo(err));
        return of<UbigeoItem[]>([]);
      }),
    );
  }

  private mensajeCatalogo(err: unknown): string {
    return apiErrorMessage(err, 'No pudimos cargar las ubicaciones. Recarga la página.');
  }

  /** Rellena el formulario con el perfil; `cargarListas` trae las opciones de su ubicación. */
  private llenar(perfil: PerfilCliente | null, cargarListas: boolean): void {
    this.original = perfil;
    const ubicacion = perfil?.ubicacion ?? null;
    // Sin emitir eventos: la cascada solo reacciona a lo que elige el cliente.
    this.form.reset(
      {
        direccion: perfil?.direccion ?? '',
        departamento_id: ubicacion?.departamento.id ?? '',
        provincia_id: ubicacion?.provincia.id ?? '',
        distrito_id: ubicacion?.distrito.id ?? '',
      },
      { emitEvent: false },
    );
    if (!cargarListas) return;

    this.provincias.set([]);
    this.distritos.set([]);
    if (!ubicacion) return;
    this.ubigeo
      .provincias(ubicacion.departamento.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (lista) => this.provincias.set(lista),
        error: (err: unknown) => this.errorCatalogo.set(this.mensajeCatalogo(err)),
      });
    this.ubigeo
      .distritos(ubicacion.provincia.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (lista) => this.distritos.set(lista),
        error: (err: unknown) => this.errorCatalogo.set(this.mensajeCatalogo(err)),
      });
  }

  /** Solo lo que cambió, ya sin espacios sobrantes. */
  private cambios(): ActualizarPerfil {
    const valor = this.form.getRawValue();
    const direccion = valor.direccion.trim();
    const cambios: ActualizarPerfil = {};
    if (direccion !== (this.original?.direccion ?? '')) cambios.direccion = direccion;
    if (valor.distrito_id !== (this.original?.ubicacion?.distrito.id ?? '')) {
      cambios.distrito_id = valor.distrito_id;
    }
    return cambios;
  }
}
