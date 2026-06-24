import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { Locomotive, LocomotiveType } from '../../core/models/locomotive.model';

/**
 * Composant de présentation pour la liste complexe de locomotives.
 *
 * Différences par rapport à `LocomotivesListComponent` (version simple) :
 *
 * 1. **Indicateurs visuels d'état pending** :
 *    - Ligne verte + badge "À ajouter"  → locomotive en attente d'ajout (id < 0)
 *    - Ligne rouge + badge "À supprimer" → locomotive distante marquée pour suppression
 *
 * 2. **Bouton Supprimer avec comportement toggle** :
 *    - Premier clic sur un item distant = marque pour suppression (rouge)
 *    - Second clic = dé-marque (retour à l'état normal)
 *    - Clic sur un ajout pending = supprime directement de la liste locale
 *
 * 3. **Tri affiché** :
 *    - Les données arrivent déjà triées alphabétiquement depuis la facade.
 *    - Le tri PrimeNG côté client est désactivé pour ne pas interférer.
 *
 * Inputs :
 * - locomotives         : page courante (triée, fusionnée distante+locale)
 * - totalRecords        : total pour le paginator
 * - loading             : spinner de chargement
 * - editMode            : active la colonne Actions
 * - pendingToRemoveIds  : IDs des items distants marqués pour suppression
 * - pendingToAddIds     : IDs temporaires (< 0) des ajouts en attente
 *
 * Outputs :
 * - lazyLoad : événement de pagination PrimeNG
 * - remove   : émet l'id (positif ou négatif) pour suppression/marquage
 */
@Component({
	selector: 'app-locomotives-complex-list',
	standalone: true,
	imports: [CommonModule, TableModule, ButtonModule, TagModule, TooltipModule],
	templateUrl: './locomotives-complex-list.component.html',
	styleUrl: './locomotives-complex-list.component.scss',
})
export class LocomotivesComplexListComponent {
	// -------------------------------------------------------------------------
	// Inputs
	// -------------------------------------------------------------------------

	/** Page courante de locomotives (déjà triée côté facade). */
	@Input() locomotives: Locomotive[] = [];

	/** Total pour la pagination PrimeNG. */
	@Input() totalRecords: number = 0;

	/** Affiche le spinner de chargement dans le tableau. */
	@Input() loading: boolean = false;

	/** Active la colonne Actions + les indicateurs de statut. */
	@Input() editMode: boolean = false;

	/**
	 * IDs des locomotives distantes marquées pour suppression.
	 * Utilisé pour appliquer la classe CSS `row--pending-remove`.
	 */
	@Input() pendingToRemoveIds: number[] = [];

	/**
	 * IDs temporaires (< 0) des locomotives en attente d'ajout.
	 * Utilisé pour appliquer la classe CSS `row--pending-add`.
	 */
	@Input() pendingToAddIds: number[] = [];

	// -------------------------------------------------------------------------
	// Outputs
	// -------------------------------------------------------------------------

	/** Événement de pagination/tri lazy PrimeNG. */
	@Output() lazyLoad = new EventEmitter<TableLazyLoadEvent>();

	/**
	 * Émet l'id de la locomotive à supprimer ou démarquer.
	 * La facade distingue les cas (id < 0 vs id > 0).
	 */
	@Output() remove = new EventEmitter<number>();

	// -------------------------------------------------------------------------
	// Configuration du tableau
	// -------------------------------------------------------------------------

	readonly pageSize = 10;
	readonly rowsPerPageOptions = [10, 25, 50, 100];

	// -------------------------------------------------------------------------
	// Méthodes utilitaires pour le template
	// -------------------------------------------------------------------------

	/**
	 * Détermine la sévérité PrimeNG Tag selon le type de traction.
	 */
	getTypeSeverity(type: LocomotiveType): 'info' | 'warn' | 'secondary' {
		switch (type) {
			case LocomotiveType.ELECTRIC:
				return 'info';
			case LocomotiveType.DIESEL:
				return 'warn';
			case LocomotiveType.STEAM:
				return 'secondary';
		}
	}

	/**
	 * Détermine le statut pending d'une locomotive pour le template.
	 * - 'add'    : ajout en attente (id < 0)
	 * - 'remove' : suppression en attente (id dans pendingToRemoveIds)
	 * - null     : aucun statut pending
	 */
	getPendingStatus(id: number): 'add' | 'remove' | null {
		if (id < 0) return 'add';
		if (this.pendingToRemoveIds.includes(id)) return 'remove';
		return null;
	}

	/**
	 * Détermine le tooltip du bouton Supprimer selon le statut.
	 * - Item en attente d'ajout     → "Annuler l'ajout"
	 * - Item marqué pour suppression → "Annuler la suppression"
	 * - Item normal                  → "Marquer pour suppression"
	 */
	getRemoveTooltip(id: number): string {
		if (id < 0) return "Annuler l'ajout";
		if (this.pendingToRemoveIds.includes(id)) return 'Annuler la suppression';
		return 'Marquer pour suppression';
	}

	/**
	 * Détermine l'icône du bouton Supprimer selon le statut.
	 * - Marqué pour suppression → pi-undo (dé-marquer)
	 * - Sinon                   → pi-trash
	 */
	getRemoveIcon(id: number): string {
		return this.pendingToRemoveIds.includes(id) ? 'pi pi-undo' : 'pi pi-trash';
	}

	onLazyLoad(event: TableLazyLoadEvent): void {
		this.lazyLoad.emit(event);
	}

	onRemove(id: number): void {
		this.remove.emit(id);
	}
}
