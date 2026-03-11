import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Card } from 'primeng/card';
import { ButtonDirective } from 'primeng/button';

/** Page d'accueil de l'application. */
@Component({
	selector: 'app-home-page',
	imports: [RouterLink, Card, ButtonDirective],
	templateUrl: './home-page.component.html',
	styleUrl: './home-page.component.scss',
})
export class HomePageComponent {}
