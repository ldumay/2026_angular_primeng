import { Injectable, signal, computed } from '@angular/core';
import { Locomotive } from '../core/models/locomotive.model';
import { LocomotiveMockService } from '../core/services/locomotive-mock.service';
import { TableLazyLoadEvent } from 'primeng/table';

/**
 * Facade réactive pour la page Locomotives.
 *
 * Rôle central (pattern Facade + Signals) :
 * - Centralise l'état de la page dans des signals Angular
 * - Isole la logique métier des composants de présentation
 * - Les composants n'interagissent qu'avec cette facade (jamais directement avec le service)
 *
 * État géré :
 * - `allLocomotives`  : tableau complet des locomotives (source de vérité locale)
 * - `visiblePage`     : page courante affichée dans le tableau
 * - `totalRecords`    : total pour la pagination (recalculé après ajout/suppression)
 * - `loading`         : indicateur de chargement simulé
 * - `editMode`        : bascule le mode édition de la table
 */
@Injectable({ providedIn: 'root' })
export class LocomotivesFacade {
	// -------------------------------------------------------------------------
	// Injection de dépendances
	// -------------------------------------------------------------------------
	constructor(private readonly service: LocomotiveMockService) {}

	// -------------------------------------------------------------------------
	// État interne (signals privés)
	// Ces signals sont la source de vérité. Ils ne sont modifiés que via les
	// méthodes publiques de la facade pour garantir la cohérence de l'état.
	// -------------------------------------------------------------------------

	/**
	 * Dataset complet de toutes les locomotives.
	 * Initialisé avec le dataset du service (100 entrées).
	 * Modifié lors des ajouts / suppressions.
	 */
	private readonly _allLocomotives = signal<Locomotive[]>([]);

	/**
	 * Page courante visible dans le tableau.
	 * Mise à jour après chaque appel lazy au service.
	 */
	private readonly _visiblePage = signal<Locomotive[]>([]);

	/** Indique si un chargement de page est en cours. */
	private readonly _loading = signal<boolean>(false);

	/**
	 * Mode édition activé/désactivé.
	 * Lorsque true : bouton Supprimer + dropdown d'ajout visibles.
	 */
	private readonly _editMode = signal<boolean>(false);

	/**
	 * Mémorise le dernier événement lazy reçu du tableau.
	 * Permet de recharger la page courante après un ajout/suppression
	 * sans que l'utilisateur ne doive changer de page manuellement.
	 */
	private _lastLazyEvent: TableLazyLoadEvent | null = null;

	// -------------------------------------------------------------------------
	// Signaux publics exposés (lecture seule pour les composants)
	// -------------------------------------------------------------------------

	/** Page de locomotives actuellement affichée dans le tableau. */
	readonly visiblePage = this._visiblePage.asReadonly();

	/** Nombre total de locomotives (pour la pagination PrimeNG). */
	readonly totalRecords = computed(() => this._allLocomotives().length);

	/** Indique si une page est en cours de chargement. */
	readonly loading = this._loading.asReadonly();

	/** Indique si le mode édition est actif. */
	readonly editMode = this._editMode.asReadonly();

	// -------------------------------------------------------------------------
	// Initialisation
	// -------------------------------------------------------------------------

	/**
	 * Initialise le dataset depuis le service.
	 * Doit être appelé une seule fois dans `ngOnInit()` de la page.
	 */
	initialize(): void {
		this._allLocomotives.set(this.service.getInitialDataset());
	}

	// -------------------------------------------------------------------------
	// Chargement lazy
	// -------------------------------------------------------------------------

	/**
	 * Charge une page de données en réponse à l'événement `onLazyLoad` de PrimeNG.
	 *
	 * Mécanique :
	 * 1. On mémorise l'événement pour pouvoir recharger la même page après mutation
	 * 2. On extrait `first` (offset) et `rows` (taille de page) de l'événement
	 * 3. On appelle le service qui simule un délai HTTP
	 * 4. On met à jour `_visiblePage` avec les données reçues
	 *
	 * @param event  Événement PrimeNG TableLazyLoadEvent
	 */
	loadPage(event: TableLazyLoadEvent): void {
		// Mémorisation de l'événement pour rechargement après mutation
		this._lastLazyEvent = event;
		this._loading.set(true);

		const offset = event.first ?? 0;
		const size = event.rows ?? 10;

		// Appel au service avec le dataset courant (reflète les ajouts/suppressions)
		this.service.getPage(offset, size, this._allLocomotives()).subscribe({
			next: ({ items }) => {
				this._visiblePage.set(items);
				this._loading.set(false);
			},
		});
	}

	// -------------------------------------------------------------------------
	// Mode édition
	// -------------------------------------------------------------------------

	/**
	 * Bascule le mode édition (toggle).
	 * Le composant page n'a pas à connaître l'état précédent.
	 */
	toggleEditMode(): void {
		this._editMode.update((v) => !v);
	}

	// -------------------------------------------------------------------------
	// CRUD local
	// -------------------------------------------------------------------------

	/**
	 * Ajoute une locomotive au dataset complet, puis recharge la page courante.
	 *
	 * Mécanique :
	 * - On génère un nouvel id unique = max(ids existants) + 1
	 * - On insère la locomotive en tête de liste (plus visible immédiatement)
	 * - On recharge la page courante pour refléter le changement
	 *
	 * @param locomotive  Locomotive à ajouter (son id sera recalculé)
	 */
	addLocomotive(locomotive: Locomotive): void {
		const current = this._allLocomotives();
		// Calcul d'un id unique basé sur le maximum existant
		const nextId = current.length > 0 ? Math.max(...current.map((l) => l.id)) + 1 : 1;
		const toAdd = new Locomotive(
			nextId,
			locomotive.series,
			locomotive.manufacturer,
			locomotive.year,
			locomotive.type,
			locomotive.country,
		);
		// Insertion en tête pour visibilité immédiate (page 1)
		this._allLocomotives.update((list) => [toAdd, ...list]);
		this._refreshCurrentPage();
	}

	/**
	 * Supprime une locomotive du dataset par son id, puis recharge la page courante.
	 *
	 * @param id  Identifiant de la locomotive à supprimer
	 */
	removeLocomotive(id: number): void {
		this._allLocomotives.update((list) => list.filter((l) => l.id !== id));
		this._refreshCurrentPage();
	}

	// -------------------------------------------------------------------------
	// Méthodes privées utilitaires
	// -------------------------------------------------------------------------

	/**
	 * Recharge la page actuellement affichée après une mutation du dataset.
	 * Utilise le dernier événement lazy mémorisé pour recalculer l'offset/size.
	 * Si aucun événement n'a encore été reçu, ne fait rien.
	 */
	private _refreshCurrentPage(): void {
		if (this._lastLazyEvent) {
			this.loadPage(this._lastLazyEvent);
		}
	}
}
