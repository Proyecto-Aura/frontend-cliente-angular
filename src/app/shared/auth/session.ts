import { Injectable, computed, signal } from '@angular/core';

const ACCESS_TOKEN_KEY = 'francos.access_token';

/** Sesión del usuario en el navegador: access_token + roles, con signals. */
@Injectable({ providedIn: 'root' })
export class Session {
  private readonly _accessToken = signal<string | null>(this.read());
  private readonly _roles = signal<string[]>([]);

  readonly accessToken = this._accessToken.asReadonly();
  readonly roles = this._roles.asReadonly();
  readonly isAuthenticated = computed(() => this._accessToken() !== null);

  start(accessToken: string, roles: string[]): void {
    this._accessToken.set(accessToken);
    this._roles.set(roles);
    this.write(accessToken);
  }

  clear(): void {
    this._accessToken.set(null);
    this._roles.set([]);
    this.write(null);
  }

  private read(): string | null {
    try {
      return localStorage.getItem(ACCESS_TOKEN_KEY);
    } catch {
      return null;
    }
  }

  private write(value: string | null): void {
    try {
      if (value) localStorage.setItem(ACCESS_TOKEN_KEY, value);
      else localStorage.removeItem(ACCESS_TOKEN_KEY);
    } catch {
      /* almacenamiento no disponible: la sesión vive solo en memoria */
    }
  }
}
