import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableLazyLoadEvent } from 'primeng/table';
import { LocomotivesFacade } from '../../states/locomotives.facade';
import { LocomotivesListComponent } from '../../components/locomotives-list/locomotives-list.component';
import { LocomotiveAddDropdownComponent } from '../../components/locomotive-add-dropdown/locomotive-add-dropdown.component';
import { Locomotive } from '../../core/models/locomotive.model';

/**
 * Page principale de la feature Locomotives.
 *
 * Rôle : orchestration (Smart Component / Container).
 * - Initialise la facade au démarrage
 * - Connecte les événements des composants enfants à la facade
 * - Passe les données et signaux aux composants enfants via @Input
 * - Ne contient aucune logique métier propre
 *
 * Architecture du template :
 *  ┌─────────────────────────────────────────┐
 *  │  En-tête de page (titre + bouton mode)  │
 *  ├─────────────────────────────────────────┤
 *  │  [Mode édition only]                    │
 *  │  app-locomotive-add-dropdown            │
 *  ├─────────────────────────────────────────┤
 *  │  app-locomotives-list (table lazy)      │
 *  └─────────────────────────────────────────┘
 */
@Component({
	selector: 'app-locomotives-page',
	standalone: true,
	imports: [
		CommonModule,
		ButtonModule,
		LocomotivesListComponent,
		LocomotiveAddDropdownComponent,
	],
	templateUrl: './locomotives-page.html',
	styleUrl: './locomotives-page.scss',
})
export class LocomotivesPage implements OnInit {
	// -------------------------------------------------------------------------
	// Injection de dépendances
	// -------------------------------------------------------------------------
	constructor(readonly facade: LocomotivesFacade) {}

	// -------------------------------------------------------------------------
	// Cycle de vie Angular
	// -------------------------------------------------------------------------

	/**
	 * Initialisation du dataset au démarrage de la page.
	 * La facade charge les 100 locomotives depuis le service mock.
	 * Le tableau se peuplera via le premier événement onLazyLoad de PrimeNG.
	 */
	ngOnInit(): void {
		this.facade.initialize();
	}

	// -------------------------------------------------------------------------
	// Gestionnaires d'événements (event handlers)
	// Ces méthodes font le pont entre les @Output des composants enfants
	// et les méthodes de la facade.
	// -------------------------------------------------------------------------

	/**
	 * Délègue le chargement lazy à la facade.
	 * Appelé par app-locomotives-list sur (lazyLoad).
	 */
	onLazyLoad(event: TableLazyLoadEvent): void {
		this.facade.loadPage(event);
	}

	/**
	 * Délègue la suppression d'une locomotive à la facade.
	 * Appelé par app-locomotives-list sur (remove).
	 */
	onRemove(id: number): void {
		this.facade.removeLocomotive(id);
	}

	/**
	 * Délègue l'ajout d'une locomotive à la facade.
	 * Appelé par app-locomotive-add-dropdown sur (add).
	 */
	onAdd(locomotive: Locomotive): void {
		this.facade.addLocomotive(locomotive);
	}

	/**
	 * Bascule le mode édition via la facade.
	 * Appelé par le bouton de l'en-tête de page.
	 */
	onToggleEditMode(): void {
		this.facade.toggleEditMode();
	}
}
