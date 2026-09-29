import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toolbar } from 'primeng/toolbar';
import { ButtonDirective, ButtonSeverity } from 'primeng/button';
import { RouterLink } from '@angular/router';

@Component({
	selector: 'app-root',
	imports: [RouterOutlet, Toolbar, ButtonDirective, RouterLink],
	standalone: true,
	templateUrl: './app.html',
	styleUrl: './app.scss',
})
export class App {

	readonly appTitle: string = 'Demo: Angular/PrimeNG 21';

	groupedLinks:GroupedAppLinks[] = [];

	currentLinks: AppLinks[] = [];

	constructor() {
		let count:number = 0;

		const groupeHome:AppLinks[] = [
			{ routerLink: '/', label: 'Accueil', severity: 'primary' }
		];
		this.groupedLinks.push({ id: count++, name: 'Accueil', links: groupeHome, severity: 'secondary' });

		const groupeForm:AppLinks[] = [
			{ routerLink: '/demo-form', label: 'Demo Form', severity: 'contrast' },
			{ routerLink: '/demo-split-button', label: 'Demo Split Button', severity: 'warn' }
		];
		this.groupedLinks.push({ id: count++, name: 'Forms', links: groupeForm, severity: 'secondary' });

		const groupeAutoComplete:AppLinks[] = [
			{ routerLink: '/autocomplete-button-sync', label: 'Autocomplete & Button', severity: 'success' },
		];
		this.groupedLinks.push({ id: count++, name: 'AutoCompletes', links: groupeAutoComplete, severity: 'secondary' });

		const groupeTable:AppLinks[] = [
			{ routerLink: '/demo-table', label: 'Demo Table', severity: 'help' },
		];
		this.groupedLinks.push({ id: count++, name: 'Tables', links: groupeTable, severity: 'secondary' });

		const groupeTableDetail:AppLinks[] = [
			{ routerLink: '/users', label: 'Utilisateurs', severity: 'secondary' },
			{ routerLink: '/import-users', label: 'Import Users', severity: 'info' },
		];
		this.groupedLinks.push({ id: count++, name: 'Tables Detail', links: groupeTableDetail, severity: 'secondary' });

		const groupeTableLazy:AppLinks[] = [
			{ routerLink: '/form-width-table', label: 'Form width table', severity: 'help' },
			{ routerLink: '/form-width-table-more', label: 'Form width table (more)', severity: 'warn' },
			{ routerLink: '/auto-scroll', label: 'Auto-Scroll', severity: 'info' },
		];
		this.groupedLinks.push({ id: count++, name: 'Tables Lazy', links: groupeTableLazy, severity: 'secondary' });

		const groupeTableLazyComplexe:AppLinks[] = [
			{ routerLink: '/lazy-table', label: 'Lazy table', severity: 'contrast' },
			{ routerLink: '/locomotives', label: 'Locomotives', severity: 'success' },
			{ routerLink: '/locomotives-complex', label: 'Locomotives (complexe)', severity: 'warn' },
		];
		this.groupedLinks.push({ id: count++, name: 'Tables Lazy Complexe', links: groupeTableLazyComplexe, severity: 'secondary' });

		const groupeAccordion:AppLinks[] = [
			{ routerLink: '/demo-accordion', label: 'Demo Accordion', severity: 'help' },
		];
		this.groupedLinks.push({ id: count++, name: 'Accordions', links: groupeAccordion, severity: 'secondary' });
	}

	updateCurrentLinks(links: AppLinks[] | null): void {
		if(links === null){
			this.currentLinks = [];
			return;
		}
		this.currentLinks = links;
	}
}

interface GroupedAppLinks {
	id: number;
	name: string;
	links: AppLinks[];
	severity: ButtonSeverity;
}
interface AppLinks {
	routerLink: string;
	label: string;
	severity: ButtonSeverity;
}
