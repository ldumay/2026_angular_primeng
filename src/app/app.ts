import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toolbar } from 'primeng/toolbar';
import { ButtonDirective } from 'primeng/button';
import { RouterLink } from '@angular/router';

@Component({
	selector: 'app-root',
	imports: [RouterOutlet, Toolbar, ButtonDirective, RouterLink],
	templateUrl: './app.html',
	styleUrl: './app.scss',
})
export class App {}
