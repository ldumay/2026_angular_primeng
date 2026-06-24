import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { TableLazyLoadEvent } from 'primeng/table';
import { LocomotivesComplexFacade } from '../../states/locomotives-complex.facade';
import { LocomotivesComplexListComponent } from '../../components/locomotives-complex-list/locomotives-complex-list.component';
import { LocomotiveAddDropdownComponent } from '../../components/locomotive-add-dropdown/locomotive-add-dropdown.component';
import { LocomotivePendingPanelComponent } from '../../components/locomotive-pending-panel/locomotive-pending-panel.component';
import { Locomotive } from '../../core/models/locomotive.model';

/**
 * Page orchestratrice de la version complexe du catalogue Locomotives.
 *
 * --- Différences principales avec LocomotivesPage (version simple) ---
 *
 * 1. **Tri alphabétique** :
 *    Les données sont automatiquement triées par `series` dans la facade.
 *    Le composant liste reçoit des données déjà ordonnées.
 *
 * 2. **Bouton Modifier → Sauvegarder** :
 *    En dehors du mode édition : bouton "Mode Édition" (bleu).
 *    En mode édition : le même espace devient deux boutons :
 *      - "Sauvegarder" avec badge de comptage des modifications (vert, actif si pendingChanges > 0)
 *      - "Annuler les modifications" (gris, toujours actif)
 *
 * 3. **État local / distant** :
 *    - Les modifications (ajouts/suppressions) s'accumulent dans un état "pending"
 *    - Elles sont visibles dans le tableau avec des indicateurs (vert/rouge)
 *    - Le panneau de résumé récapitule les changements par catégorie
 *    - Seul `save()` les persiste dans l'état distant
 *
 * 4. **Panneau Pending** :
 *    Un composant dédié `app-locomotive-pending-panel` liste les modifications
 *    en attente avec possibilité d'annuler item par item.
 *
 * Ce composant est un Smart Component : il orchestre sans logique métier propre.
 */
@Component({
	selector: 'app-locomotives-complex-page',
	standalone: true,
	imports: [
		CommonModule,
		ButtonModule,
		BadgeModule,
		LocomotivesComplexListComponent,
		LocomotiveAddDropdownComponent,
		LocomotivePendingPanelComponent,
	],
	templateUrl: './locomotives-complex-page.html',
	styleUrl: './locomotives-complex-page.scss',
})
export class LocomotivesComplexPage implements OnInit {
	constructor(readonly facade: LocomotivesComplexFacade) {}

	// -------------------------------------------------------------------------
	// Cycle de vie
	// -------------------------------------------------------------------------

	/**
	 * Initialise le dataset distant depuis le service mock.
	 * La façade trie automatiquement les données à l'initialisation.
	 */
	ngOnInit(): void {
		this.facade.initialize();
	}

	// -------------------------------------------------------------------------
	// Gestionnaires d'événements (pont composants → facade)
	// -------------------------------------------------------------------------

	/** Délègue le chargement lazy à la facade. */
	onLazyLoad(event: TableLazyLoadEvent): void {
		this.facade.loadPage(event);
	}

	/** Délègue la suppression ou le marquage à la facade. */
	onRemove(id: number): void {
		this.facade.removeOrMarkForRemoval(id);
	}

	/**
	 * Délègue l'ajout d'un ajout en attente à la facade.
	 * NB : L'ajout n'est PAS immédiatement dans l'état distant —
	 * il reste dans _pendingToAdd jusqu'à save().
	 */
	onAdd(locomotive: Locomotive): void {
		this.facade.addPending(locomotive);
	}

	/** Active le mode édition via la facade. */
	onEnterEditMode(): void {
		this.facade.enterEditMode();
	}

	/**
	 * Sauvegarde toutes les modifications en attente.
	 * Après save(), l'état distant = l'état visible.
	 */
	onSave(): void {
		this.facade.save();
	}

	/**
	 * Annule toutes les modifications en attente sans sauvegarder.
	 * Retour à l'état distant pur.
	 */
	onDiscard(): void {
		this.facade.discard();
	}

	/**
	 * Annule un ajout en attente spécifique (depuis le panneau pending).
	 * Délègue à `removeOrMarkForRemoval` avec un ID négatif.
	 */
	onCancelAdd(tempId: number): void {
		this.facade.removeOrMarkForRemoval(tempId);
	}

	/**
	 * Annule le marquage de suppression d'un item (depuis le panneau pending).
	 * Délègue à `removeOrMarkForRemoval` qui toggle le Set.
	 */
	onCancelRemoval(id: number): void {
		this.facade.removeOrMarkForRemoval(id);
	}
}
