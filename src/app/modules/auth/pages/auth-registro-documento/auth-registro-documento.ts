import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthRegisterDocForm } from '../../components/auth-register-doc-form/auth-register-doc-form';

/** Registro · paso 1 (documento). Hijo de auth-layout. */
@Component({
  selector: 'app-auth-registro-documento',
  imports: [RouterLink, AuthRegisterDocForm],
  host: { class: 'block w-full max-w-[512px] my-auto animate-fade-up' },
  templateUrl: './auth-registro-documento.html',
})
export class AuthRegistroDocumento {}
