import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Toaster } from './shared/ui/toast/toaster';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toaster],
  templateUrl: './app.html',
})
export class App {}
