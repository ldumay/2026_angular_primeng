import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Locomotive } from '../../core/models/locomotive.model';

/**
 * Composant de résumé des modifications en attente (Pending Changes Panel).
 *
 * Rôle : informer l'utilisateur de l'état des modifications non sauvegardées
 * et lui offrir la possibilité d'annuler des changements individuels.
 *
 * Ce composant est purement présentationnel (Dumb Component) :
 * - Reçoit les données via @Input
 * - Émet des événements d'annulation via @Output
 * - Aucune dépendance sur la facade ou le service
 *
 * Inputs :
 * - pendingAdds     : locomotives à ajouter (IDs temporaires < 0)
 * - pendingRemovals : locomotives distantes marquées pour suppression
 *
 * Outputs :
 * - cancelAdd       : émet l'id temporaire de l'ajout à annuler
 * - cancelRemoval   : émet l'id distant dont on annule le marquage
 */
@Component({
	selector: 'app-locomotive-pending-panel',
	standalone: true,
	imports: [CommonModule, ButtonModule],
	templateUrl: './locomotive-pending-panel.component.html',
	styleUrl: './locomotive-pending-panel.component.scss',
})
export class LocomotivePendingPanelComponent {
	// -------------------------------------------------------------------------
	// Inputs
	// -------------------------------------------------------------------------

	/** Locomotives en attente d'ajout (IDs temporaires négatifs). */
	@Input() pendingAdds: Locomotive[] = [];

	/** Locomotives distantes marquées pour suppression. */
	@Input() pendingRemovals: Locomotive[] = [];

	// -------------------------------------------------------------------------
	// Outputs
	// -------------------------------------------------------------------------

	/**
	 * Émet l'id temporaire (< 0) pour annuler un ajout en attente.
	 * Géré par la facade via `removeOrMarkForRemoval(id)`.
	 */
	@Output() cancelAdd = new EventEmitter<number>();

	/**
	 * Émet l'id positif pour dé-marquer une suppression en attente.
	 * Géré par la facade via `removeOrMarkForRemoval(id)` qui toggle.
	 */
	@Output() cancelRemoval = new EventEmitter<number>();

	// -------------------------------------------------------------------------
	// Computed helper
	// -------------------------------------------------------------------------

	/** Nombre total de changements en attente. */
	get totalPending(): number {
		return this.pendingAdds.length + this.pendingRemovals.length;
	}
}
