import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Layout de autenticación: pantalla partida.
 *  - Izquierda: panel de marca (degradado rojo, logo, claim, features). Oculto en móvil.
 *  - Derecha: página activa (login, registro, recuperar) centrada.
 */
@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet],
  host: { class: 'block min-h-screen' },
  templateUrl: './auth-layout.html',
})
export class AuthLayout {}
