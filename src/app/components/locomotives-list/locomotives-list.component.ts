import {
	Component,
	EventEmitter,
	Input,
	Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { Locomotive, LocomotiveType } from '../../core/models/locomotive.model';

/**
 * Composant de présentation de la liste lazy de locomotives.
 *
 * Rôle : affichage uniquement (Dumb/Presentational Component).
 * - Reçoit toutes les données via @Input
 * - Remonte les événements utilisateur via @Output
 * - Ne connaît pas la facade ni le service
 *
 * Inputs :
 * - locomotives    : page courante de données à afficher
 * - totalRecords   : total pour la pagination PrimeNG
 * - loading        : affiche le spinner de chargement
 * - editMode       : active la colonne "Actions" et les boutons Supprimer
 *
 * Outputs :
 * - lazyLoad       : événement PrimeNG de pagination/tri (remonté à la page)
 * - remove         : émet l'id de la locomotive à supprimer
 */
@Component({
	selector: 'app-locomotives-list',
	standalone: true,
	imports: [CommonModule, TableModule, ButtonModule, TagModule],
	templateUrl: './locomotives-list.component.html',
	styleUrl: './locomotives-list.component.scss',
})
export class LocomotivesListComponent {
	// -------------------------------------------------------------------------
	// Inputs (données injectées par la page parente)
	// -------------------------------------------------------------------------

	/** Page courante de locomotives à afficher dans le tableau */
	@Input() locomotives: Locomotive[] = [];

	/** Nombre total d'enregistrements (pour le paginator PrimeNG) */
	@Input() totalRecords: number = 0;

	/** Affiche le spinner PrimeNG dans le tableau pendant le chargement */
	@Input() loading: boolean = false;

	/**
	 * Bascule l'affichage de la colonne "Actions".
	 * Lorsque true : bouton Supprimer visible sur chaque ligne.
	 */
	@Input() editMode: boolean = false;

	// -------------------------------------------------------------------------
	// Outputs (événements remontés vers la page parente)
	// -------------------------------------------------------------------------

	/** Événement de chargement lazy de PrimeNG (contient first, rows, etc.) */
	@Output() lazyLoad = new EventEmitter<TableLazyLoadEvent>();

	/** Émet l'identifiant de la locomotive à supprimer */
	@Output() remove = new EventEmitter<number>();

	// -------------------------------------------------------------------------
	// Configuration du tableau
	// -------------------------------------------------------------------------

	/** Nombre de lignes par défaut par page */
	readonly pageSize = 10;

	/** Options de pagination */
	readonly rowsPerPageOptions = [10, 25, 50, 100];

	// -------------------------------------------------------------------------
	// Méthodes utilitaires pour le template
	// -------------------------------------------------------------------------

	/**
	 * Retourne la sévérité PrimeNG du tag selon le type de traction.
	 * Permet une coloration visuelle rapide et cohérente.
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
	 * Handler de l'événement lazy PrimeNG.
	 * Délègue simplement à la page via le @Output.
	 */
	onLazyLoad(event: TableLazyLoadEvent): void {
		this.lazyLoad.emit(event);
	}

	/**
	 * Handler du bouton Supprimer.
	 * Émet l'id vers la page parente qui appellera la facade.
	 */
	onRemove(id: number): void {
		this.remove.emit(id);
	}
}
