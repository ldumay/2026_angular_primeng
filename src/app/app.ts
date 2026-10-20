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

    readonly angularLinks: AppLinks[] = [
        { routerLink: '/', label: 'Accueil', severity: 'secondary' },
    ];

    readonly angularGroupedLinks: GroupedAppLinks[] = [
        {
            name: 'Essentials',
            links: [{ routerLink: '/logs', label: 'Logs', severity: 'secondary' }],
            severity: 'secondary',
        },
    ];

    readonly primeNgGroupedLinks: GroupedAppLinks[] = [
        {
            name: 'Forms',
            links: [
                { routerLink: '/demo-form', label: 'Demo Form', severity: 'contrast' },
                { routerLink: '/demo-split-button', label: 'Demo Split Button', severity: 'warn' },
                { routerLink: '/demo-form-detail', label: 'Demo Form Detail', severity: 'help' },
            ],
            severity: 'secondary',
        },
        {
            name: 'AutoCompletes',
            links: [{ routerLink: '/autocomplete-button-sync', label: 'Autocomplete & Button', severity: 'success' }],
            severity: 'secondary',
        },
        {
            name: 'Tables',
            links: [{ routerLink: '/demo-table', label: 'Demo Table', severity: 'help' }],
            severity: 'secondary',
        },
        {
            name: 'Tables Detail',
            links: [
                { routerLink: '/users', label: 'Utilisateurs', severity: 'secondary' },
                { routerLink: '/import-users', label: 'Import Users', severity: 'info' },
            ],
            severity: 'secondary',
        },
        {
            name: 'Tables Lazy',
            links: [
                { routerLink: '/form-width-table', label: 'Form width table', severity: 'help' },
                { routerLink: '/form-width-table-more', label: 'Form width table (more)', severity: 'warn' },
                { routerLink: '/auto-scroll', label: 'Auto-Scroll', severity: 'info' },
            ],
            severity: 'secondary',
        },
        {
            name: 'Tables Lazy Complexe',
            links: [
                { routerLink: '/lazy-table', label: 'Lazy table', severity: 'contrast' },
                { routerLink: '/locomotives', label: 'Locomotives', severity: 'success' },
                { routerLink: '/locomotives-complex', label: 'Locomotives (complexe)', severity: 'warn' },
            ],
            severity: 'secondary',
        },
        {
            name: 'Accordions',
            links: [
                { routerLink: '/demo-accordion', label: 'Demo Accordion', severity: 'help' },
                { routerLink: '/demo-accordion-more', label: 'Demo Accordion More', severity: 'contrast' },
            ],
            severity: 'secondary',
        },
    ];

    currentLinks: AppLinks[] = [];

    updateCurrentLinks(links: AppLinks[] | null): void {
        if (links === null) {
            this.currentLinks = [];
            return;
        }
        this.currentLinks = links;
    }
}

interface GroupedAppLinks {
    name: string;
    links: AppLinks[];
    severity: ButtonSeverity;
}
interface AppLinks {
    routerLink: string;
    label: string;
    severity: ButtonSeverity;
}
