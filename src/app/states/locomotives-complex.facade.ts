import { Injectable, signal, computed } from '@angular/core';
import { Locomotive } from '../core/models/locomotive.model';
import { LocomotiveMockService } from '../core/services/locomotive-mock.service';
import { TableLazyLoadEvent } from 'primeng/table';

// ---------------------------------------------------------------------------
// Types internes à la facade
// ---------------------------------------------------------------------------

/**
 * Représente l'ensemble des modifications en attente (non encore sauvegardées).
 * Ce type centralise la notion d'état "brouillon" avant commit vers l'état distant.
 *
 * - `toAdd`       : locomotives à ajouter (ids temporaires négatifs)
 * - `toRemoveIds` : Set des ids de locomotives distantes à supprimer
 */
interface PendingChanges {
	toAdd: Locomotive[];
	toRemoveIds: Set<number>;
}

// ---------------------------------------------------------------------------

/**
 * Facade réactive complexe pour la page Locomotives (version avancée).
 *
 * --- Concept clé : double état local / distant ---
 *
 * La facade distingue deux couches d'état :
 *
 * 1. État DISTANT (_remoteLocomotives) :
 *    Ce que le serveur connaît. Initialisé depuis le service mock.
 *    Mis à jour uniquement lors de l'appel à `save()`.
 *
 * 2. État LOCAL (_pendingChanges) :
 *    Les modifications en cours non encore persistées.
 *    Contient les ajouts et suppressions en attente.
 *
 * 3. État VISIBLE (_localLocomotives, computed) :
 *    Union de l'état distant + ajouts pending, triée alphabétiquement.
 *    Les suppressions pending sont toujours visibles mais marquées visuellement.
 *
 * --- Tri alphabétique ---
 *    Le signal computed `_localLocomotives` trie automatiquement par `series`
 *    après chaque mutation, garantissant un ordre cohérent quelle que soit
 *    la position d'insertion.
 *
 * --- Mécanique d'enregistrement (save / discard) ---
 *    `save()`    : fusionne les pending changes dans l'état distant → clear pending → exit edit mode
 *    `discard()` : annule toutes les pending changes → exit edit mode
 *
 * --- IDs temporaires ---
 *    Les locomotives ajoutées (avant save) reçoivent un ID négatif décrémental.
 *    Cela permet de les identifier comme "locales uniquement" dans les composants.
 *    Lors du save, des IDs positifs permanents leur sont assignés.
 */
@Injectable({ providedIn: 'root' })
export class LocomotivesComplexFacade {
	constructor(private readonly service: LocomotiveMockService) {}

	// -------------------------------------------------------------------------
	// État DISTANT — source de vérité persistée (simulée)
	// -------------------------------------------------------------------------

	/**
	 * Représente l'état côté "serveur" : les données sauvegardées.
	 * N'est jamais modifié directement en édition — uniquement via `save()`.
	 */
	private readonly _remoteLocomotives = signal<Locomotive[]>([]);

	// -------------------------------------------------------------------------
	// État LOCAL — modifications en cours (non sauvegardées)
	// -------------------------------------------------------------------------

	/**
	 * Locomotives à ajouter (IDs temporaires < 0).
	 * Vidé après save ou discard.
	 */
	private readonly _pendingToAdd = signal<Locomotive[]>([]);

	/**
	 * Set des IDs de locomotives distantes marquées pour suppression.
	 * Ces locomotives restent visibles avec un indicateur visuel jusqu'au save.
	 * Utilisation d'un Set pour une recherche O(1) dans le template.
	 *
	 * IMPORTANT : toujours créer un nouveau Set lors de la mise à jour
	 * pour déclencher la réactivité du signal (mutation in-place ignorée).
	 */
	private readonly _pendingToRemoveIds = signal<Set<number>>(new Set());

	/** Compteur décrémental pour les IDs temporaires des ajouts en attente. */
	private _pendingIdCounter = 0;

	// -------------------------------------------------------------------------
	// État UI
	// -------------------------------------------------------------------------

	private readonly _loading = signal<boolean>(false);
	private readonly _editMode = signal<boolean>(false);
	private readonly _visiblePage = signal<Locomotive[]>([]);

	/**
	 * Dernier événement lazy PrimeNG reçu.
	 * Conservé pour permettre le rechargement de la page courante
	 * après une mutation du dataset (add / remove / save / discard).
	 */
	private _lastLazyEvent: TableLazyLoadEvent | null = null;

	// -------------------------------------------------------------------------
	// Signal COMPUTED : état visible combiné et trié
	// -------------------------------------------------------------------------

	/**
	 * Fusion de l'état distant et des ajouts en attente, triée alphabétiquement.
	 *
	 * Mécanique :
	 * - Les items de `_remoteLocomotives` (hors suppression pending visible ici aussi)
	 *   + les items de `_pendingToAdd` forment le dataset complet visible.
	 * - Les items marqués pour suppression (`_pendingToRemoveIds`) restent inclus
	 *   dans ce dataset : ils sont distingués visuellement côté template.
	 * - Le tri par `series` (localeCompare 'fr') est appliqué à chaque recomputation.
	 *
	 * Ce signal est recomputed automatiquement dès que `_remoteLocomotives`,
	 * `_pendingToAdd` ou `_pendingToRemoveIds` changent.
	 */
	private readonly _localLocomotives = computed<Locomotive[]>(() => {
		const remote = this._remoteLocomotives();
		const toAdd = this._pendingToAdd();
		// Fusion : distants + ajouts locaux
		const merged = [...remote, ...toAdd];
		// Tri alphabétique sur la série (locale française)
		return merged.sort((a, b) => a.series.localeCompare(b.series, 'fr', { sensitivity: 'base' }));
	});

	// -------------------------------------------------------------------------
	// Signaux publics (lecture seule pour les composants)
	// -------------------------------------------------------------------------

	/** Page courante affichée dans le tableau lazy. */
	readonly visiblePage = this._visiblePage.asReadonly();

	/**
	 * Nombre total d'items dans le dataset visible.
	 * Inclut les items distants ET les ajouts pending.
	 * Les suppressions pending sont toujours comptées (visibles avec indicateur).
	 */
	readonly totalRecords = computed(() => this._localLocomotives().length);

	readonly loading = this._loading.asReadonly();
	readonly editMode = this._editMode.asReadonly();

	/** Liste des locomotives ajoutées en attente (pour le panneau de résumé). */
	readonly pendingAdds = this._pendingToAdd.asReadonly();

	/**
	 * Liste des locomotives distantes marquées pour suppression.
	 * Calculée à partir des IDs dans `_pendingToRemoveIds`.
	 */
	readonly pendingRemovals = computed<Locomotive[]>(() => {
		const ids = this._pendingToRemoveIds();
		return this._remoteLocomotives().filter((l) => ids.has(l.id));
	});

	/**
	 * Tableau des IDs en attente de suppression.
	 * Exposé en tableau (plus simple à consommer dans les templates @if / includes).
	 */
	readonly pendingToRemoveIds = computed<number[]>(() => [...this._pendingToRemoveIds()]);

	/**
	 * Nombre total de changements en attente.
	 * Affiché comme badge sur le bouton "Sauvegarder".
	 */
	readonly pendingCount = computed(
		() => this._pendingToAdd().length + this._pendingToRemoveIds().size,
	);

	/**
	 * Indique s'il existe au moins un changement en attente.
	 * Contrôle l'activation du bouton "Sauvegarder".
	 */
	readonly hasPendingChanges = computed(() => this.pendingCount() > 0);

	// -------------------------------------------------------------------------
	// Initialisation
	// -------------------------------------------------------------------------

	/**
	 * Charge le dataset initial depuis le service.
	 * À appeler une seule fois dans `ngOnInit()` de la page.
	 * Ne doit pas être rappelé — utiliser `_refreshCurrentPage()` pour les updates.
	 */
	initialize(): void {
		this._remoteLocomotives.set(this.service.getInitialDataset());
	}

	// -------------------------------------------------------------------------
	// Chargement lazy
	// -------------------------------------------------------------------------

	/**
	 * Charge une page depuis le dataset local (fusion distante + pending).
	 *
	 * Flux :
	 * 1. Mémorise l'event (offset, size) pour rechargement après mutation
	 * 2. Passe le dataset trié `_localLocomotives()` au service
	 * 3. Le service tranche et retourne après délai simulé
	 * 4. Mise à jour de `_visiblePage`
	 *
	 * @param event  Événement PrimeNG contenant `first` (offset) et `rows` (taille)
	 */
	loadPage(event: TableLazyLoadEvent): void {
		this._lastLazyEvent = event;
		this._loading.set(true);

		const offset = event.first ?? 0;
		const size = event.rows ?? 10;

		// On passe le dataset fusionné et trié — le service n'a qu'à trancher
		this.service.getPage(offset, size, this._localLocomotives()).subscribe({
			next: ({ items }) => {
				this._visiblePage.set(items);
				this._loading.set(false);
			},
		});
	}

	// -------------------------------------------------------------------------
	// Mode édition
	// -------------------------------------------------------------------------

	/** Active le mode édition. Ne réinitialise pas les pending changes existantes. */
	enterEditMode(): void {
		this._editMode.set(true);
	}

	// -------------------------------------------------------------------------
	// Modifications en attente (Pending Changes)
	// -------------------------------------------------------------------------

	/**
	 * Ajoute une locomotive à la liste des ajouts en attente.
	 *
	 * Mécanique :
	 * - Un ID temporaire négatif (décrémental) est assigné pour identifier
	 *   cette locomotive comme "locale uniquement" jusqu'au save.
	 * - La locomotive est ajoutée à `_pendingToAdd`.
	 * - `_localLocomotives` se recompute automatiquement (fusion + tri).
	 * - La page courante est rechargée pour refléter l'ajout.
	 *
	 * @param locomotive  Locomotive sélectionnée dans le dropdown
	 */
	addPending(locomotive: Locomotive): void {
		// ID temporaire négatif : distingue les ajouts locaux des items distants
		const tempId = --this._pendingIdCounter;
		const toAdd = new Locomotive(
			tempId,
			locomotive.series,
			locomotive.manufacturer,
			locomotive.year,
			locomotive.type,
			locomotive.country,
		);
		this._pendingToAdd.update((list) => [...list, toAdd]);
		this._refreshCurrentPage();
	}

	/**
	 * Supprime ou marque une locomotive selon son origine :
	 *
	 * - Si id < 0 (ajout local en attente) → retire de `_pendingToAdd` (annulation immédiate)
	 * - Si id > 0 (item distant) → bascule le marquage dans `_pendingToRemoveIds`
	 *   (toggle : re-cliquer annule le marquage)
	 *
	 * Cette distinction est transparente pour les composants enfants
	 * qui appellent simplement `onRemove(id)`.
	 *
	 * @param id  Identifiant de la locomotive (positif = distant, négatif = local)
	 */
	removeOrMarkForRemoval(id: number): void {
		if (id < 0) {
			// Ajout en attente → annulation directe (n'a jamais existé côté serveur)
			this._pendingToAdd.update((list) => list.filter((l) => l.id !== id));
		} else {
			// Item distant → toggle du marquage de suppression
			this._pendingToRemoveIds.update((s) => {
				const newSet = new Set(s); // Nouveau Set obligatoire pour la réactivité Signal
				if (newSet.has(id)) {
					newSet.delete(id); // Dé-marquer si déjà marqué
				} else {
					newSet.add(id); // Marquer pour suppression
				}
				return newSet;
			});
		}
		this._refreshCurrentPage();
	}

	// -------------------------------------------------------------------------
	// Sauvegarde / Annulation
	// -------------------------------------------------------------------------

	/**
	 * Applique toutes les modifications en attente à l'état distant.
	 *
	 * Opérations effectuées :
	 * 1. Suppression des items marqués dans `_pendingToRemoveIds`
	 * 2. Ajout des items de `_pendingToAdd` avec des IDs permanents positifs
	 * 3. Réinitialisation de tous les pending changes
	 * 4. Sortie du mode édition
	 * 5. Rechargement de la page courante
	 *
	 * Après `save()`, l'état distant == l'état visible.
	 */
	save(): void {
		const toAdd = this._pendingToAdd();
		const toRemoveIds = this._pendingToRemoveIds();

		this._remoteLocomotives.update((list) => {
			// Étape 1 : Supprimer les items marqués
			const afterRemovals = list.filter((l) => !toRemoveIds.has(l.id));
			// Étape 2 : Assigner des IDs permanents aux ajouts
			const maxId =
				afterRemovals.length > 0 ? Math.max(...afterRemovals.map((l) => l.id)) : 0;
			const added = toAdd.map(
				(l, i) =>
					new Locomotive(maxId + i + 1, l.series, l.manufacturer, l.year, l.type, l.country),
			);
			return [...afterRemovals, ...added];
		});

		// Réinitialisation complète de l'état pending
		this._clearPendingChanges();
		// Sortie du mode édition
		this._editMode.set(false);
		// Rechargement
		this._refreshCurrentPage();
	}

	/**
	 * Annule toutes les modifications en attente sans sauvegarder.
	 * Restaure l'état visible à l'état distant.
	 */
	discard(): void {
		this._clearPendingChanges();
		this._editMode.set(false);
		this._refreshCurrentPage();
	}

	// -------------------------------------------------------------------------
	// Utilitaires privés
	// -------------------------------------------------------------------------

	/** Recharge la page courante avec le dataset muté. */
	private _refreshCurrentPage(): void {
		if (this._lastLazyEvent) {
			this.loadPage(this._lastLazyEvent);
		}
	}

	/** Réinitialise l'ensemble des modifications en attente et le compteur d'IDs. */
	private _clearPendingChanges(): void {
		this._pendingToAdd.set([]);
		this._pendingToRemoveIds.set(new Set());
		this._pendingIdCounter = 0;
	}
}
