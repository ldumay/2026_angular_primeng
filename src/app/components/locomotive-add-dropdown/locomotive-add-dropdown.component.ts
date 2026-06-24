import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { Locomotive } from '../../core/models/locomotive.model';
import { LocomotiveMockService } from '../../core/services/locomotive-mock.service';

/**
 * Composant de saisie pour l'ajout d'une locomotive en mode édition.
 *
 * Rôle : permettre à l'utilisateur de sélectionner une locomotive dans une
 * liste générée aléatoirement, puis de l'ajouter à la liste principale.
 *
 * Mécanique en deux étapes :
 * 1. L'utilisateur clique "Générer 10 locomotives" :
 *    → Le service génère 10 locomotives aléatoires
 *    → Le p-select (dropdown) est peuplé avec ces options
 *
 * 2. L'utilisateur sélectionne une locomotive dans le dropdown, puis clique "Ajouter" :
 *    → L'événement `add` est émis vers la page parente
 *    → La sélection est réinitialisée (prêt pour un nouvel ajout)
 *
 * Ce composant ne connaît pas la facade : il délègue l'ajout via @Output.
 */
@Component({
	selector: 'app-locomotive-add-dropdown',
	standalone: true,
	imports: [CommonModule, ButtonModule, SelectModule, FormsModule],
	templateUrl: './locomotive-add-dropdown.component.html',
	styleUrl: './locomotive-add-dropdown.component.scss',
})
export class LocomotiveAddDropdownComponent {
	// -------------------------------------------------------------------------
	// Injection de dépendances
	// -------------------------------------------------------------------------
	constructor(private readonly service: LocomotiveMockService) {}

	// -------------------------------------------------------------------------
	// Outputs
	// -------------------------------------------------------------------------

	/**
	 * Émet la locomotive sélectionnée pour que la page parente l'ajoute
	 * via la facade. Ce composant ne gère pas le dataset global.
	 */
	@Output() add = new EventEmitter<Locomotive>();

	// -------------------------------------------------------------------------
	// État local (signals)
	// Ces signals sont internes à ce composant uniquement.
	// -------------------------------------------------------------------------

	/**
	 * Liste des 10 locomotives générées aléatoirement.
	 * Vide au départ : l'utilisateur doit d'abord cliquer "Générer".
	 */
	readonly generatedLocomotives = signal<Locomotive[]>([]);

	/**
	 * Locomotive actuellement sélectionnée dans le dropdown.
	 * Null si aucune sélection.
	 */
	readonly selectedLocomotive = signal<Locomotive | null>(null);

	// -------------------------------------------------------------------------
	// Actions utilisateur
	// -------------------------------------------------------------------------

	/**
	 * Génère 10 nouvelles locomotives aléatoires via le service.
	 * Réinitialise la sélection courante pour forcer un nouveau choix.
	 */
	generate(): void {
		const generated = this.service.generateRandom(10);
		this.generatedLocomotives.set(generated);
		// Réinitialisation de la sélection : l'ancienne liste est remplacée
		this.selectedLocomotive.set(null);
	}

	/**
	 * Émet la locomotive sélectionnée vers la page parente.
	 * Réinitialise l'état local après l'émission.
	 */
	addSelected(): void {
		const loco = this.selectedLocomotive();
		if (!loco) return; // Garde : ne rien faire si rien n'est sélectionné

		this.add.emit(loco);

		// Réinitialisation : prêt pour un nouvel ajout
		this.selectedLocomotive.set(null);
		this.generatedLocomotives.set([]);
	}

	/**
	 * Getter calculé : vrai si le bouton "Ajouter" doit être actif.
	 * Désactivé si aucune locomotive n'est sélectionnée.
	 */
	get canAdd(): boolean {
		return this.selectedLocomotive() !== null;
	}
}
