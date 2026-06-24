# Documentation technique — Feature : Page Locomotives (Liste Lazy + Mode Édition)

## Liens associés
- Architecture générale du projet : `docs/architecture-et-mecaniques.md`
- Reactive Forms et CVA : `docs/reactive-forms-et-cva.md`
- **Annexe — Glossaire Angular / PrimeNG** : `docs/glossaire-angular-primeng.md`

---

## 1) Objectif de la feature

Cette feature regroupe **deux pages dédiées** au catalogue de locomotives, chacune
illustrant une mécanique progressive de liste lazy éditable :

| Page | Route | Branche Git | Complexité |
|---|---|---|---|
| Locomotives (simple) | `/locomotives` | `feature/locomotives-lazy-editable-list` | Édition immédiate |
| Locomotives (complexe) | `/locomotives-complex` | `feature/locomotives-complex-editable-list` | Édition différée avec état local/distant |

---

## 2) Fichiers créés

### Version simple (`feature/locomotives-lazy-editable-list`)

```
src/app/core/models/
  └── locomotive.model.ts               ← Modèle domaine + enum LocomotiveType

src/app/core/services/
  └── locomotive-mock.service.ts        ← Dataset 100 entrées + génération aléatoire

src/app/states/
  └── locomotives.facade.ts             ← Facade Signals (état + CRUD immédiat)

src/app/components/
  ├── locomotives-list/                 ← Composant Dumb : table lazy
  └── locomotive-add-dropdown/          ← Composant Dumb : génération + sélection

src/app/views/
  └── locomotives-page/                 ← Page Smart : orchestration (version simple)
```

### Version complexe (`feature/locomotives-complex-editable-list`)

```
src/app/states/
  └── locomotives-complex.facade.ts     ← Facade complexe : état local/distant, pending, tri

src/app/components/
  ├── locomotives-complex-list/         ← Composant Dumb : table lazy avec statuts pending
  └── locomotive-pending-panel/         ← Composant Dumb : résumé des modifications en attente

src/app/views/
  └── locomotives-complex-page/         ← Page Smart : orchestration (version complexe)
```

Fichiers modifiés (commun aux deux branches) :
- `src/app/app.routes.ts` → routes `/locomotives` et `/locomotives-complex`
- `src/app/app.html` → boutons de navigation "Locomotives" et "Locomotives (complexe)"

---

## 3) Modèle domaine : `Locomotive`

**Fichier** : `src/app/core/models/locomotive.model.ts`

```typescript
export enum LocomotiveType {
  ELECTRIC = 'Électrique',
  DIESEL   = 'Diesel',
  STEAM    = 'Vapeur',
}

export class Locomotive {
  constructor(
    public id: number,           // négatif = temporaire (ajout local non sauvegardé)
    public series: string,       // ex. « BB 7200 » — sert aussi à l'ordre alphabétique
    public manufacturer: string,
    public year: number,
    public type: LocomotiveType,
    public country: string,
  ) {}

  get key(): string { ... }        // clé PrimeNG dataKey
  get displayName(): string { ... } // « Série (Année) — Constructeur »
}
```

> **Convention d'IDs** : les locomotives en attente d'ajout (version complexe)
> reçoivent un **ID temporaire négatif** décrémental (−1, −2, …). Cela permet
> aux composants et à la facade de distinguer l'origine d'un item sans champ dédié.
> Lors du `save()`, des IDs positifs permanents leur sont assignés.

---

## 4) Service mock : `LocomotiveMockService`

**Fichier** : `src/app/core/services/locomotive-mock.service.ts`

### Responsabilités

| Méthode | Rôle |
|---|---|
| `getInitialDataset()` | Retourne une copie des 100 locomotives déterministes |
| `getPage(offset, size, dataset)` | Tranche le dataset et retourne via `Observable` (délai 300 ms) |
| `generateRandom(count)` | Génère `count` locomotives aléatoires (pour le dropdown) |

### Mécanique du dataset déterministe

```
Dataset = 100 locomotives via index cyclique :
  series       = SERIES_POOL[i % pool.length]
  manufacturer = MANUFACTURER_POOL[i % pool.length]
  year         = YEAR_MIN + (i * 7) % (YEAR_MAX - YEAR_MIN + 1)
  type         = TYPE_POOL[i % pool.length]
  country      = COUNTRY_POOL[i % pool.length]
```

### Mécanique du lazy (getPage)

```typescript
getPage(offset, size, currentDataset): Observable<{items, total}> {
  const items = currentDataset.slice(offset, offset + size);
  return of({ items, total: currentDataset.length }).pipe(delay(300));
}
```

Le dataset passé est **celui fourni par la facade** (pas le dataset interne du service).
Cela permet de refléter les ajouts/suppressions sans ré-initialiser le service.

---

## 5) Facade simple : `LocomotivesFacade`

**Fichier** : `src/app/states/locomotives.facade.ts`

### Pattern : Facade + Signals (édition immédiate)

Toute modification (ajout, suppression) est **appliquée immédiatement** à l'état unique
`_allLocomotives`. Il n'y a pas de distinction état local/distant.

### Signals internes

| Signal | Type | Rôle |
|---|---|---|
| `_allLocomotives` | `Locomotive[]` | Source de vérité unique |
| `_visiblePage` | `Locomotive[]` | Page courante |
| `_loading` | `boolean` | Spinner |
| `_editMode` | `boolean` | Mode édition |
| `_lastLazyEvent` | `TableLazyLoadEvent \| null` | Mémorisation pour refresh |

### Méthodes publiques

| Méthode | Rôle |
|---|---|
| `initialize()` | Charge le dataset initial |
| `loadPage(event)` | Lazy load (mémorise l'event) |
| `toggleEditMode()` | Bascule le mode édition |
| `addLocomotive(l)` | Ajoute + refresh |
| `removeLocomotive(id)` | Supprime + refresh |

---

## 6) Facade complexe : `LocomotivesComplexFacade`

**Fichier** : `src/app/states/locomotives-complex.facade.ts`

### Concept clé : double état local / distant

```
┌─────────────────────────────────────────────────────────┐
│  État DISTANT (_remoteLocomotives)                       │
│  = ce que le serveur connaît (après save())             │
├─────────────────────────────────────────────────────────┤
│  État LOCAL (pending changes)                            │
│  ├── _pendingToAdd       : locomotives à ajouter         │
│  └── _pendingToRemoveIds : IDs à supprimer (Set)         │
├─────────────────────────────────────────────────────────┤
│  État VISIBLE (_localLocomotives, computed)              │
│  = remote + pendingToAdd, trié alphabétiquement         │
│  Les items marqués pour suppression y restent (visuels) │
└─────────────────────────────────────────────────────────┘
```

### Tri alphabétique via `computed`

```typescript
private readonly _localLocomotives = computed<Locomotive[]>(() => {
  const merged = [...this._remoteLocomotives(), ...this._pendingToAdd()];
  return merged.sort((a, b) =>
    a.series.localeCompare(b.series, 'fr', { sensitivity: 'base' })
  );
});
```

Ce signal se recompute automatiquement dès que `_remoteLocomotives` ou `_pendingToAdd`
changent. Le tri est toujours cohérent, quelle que soit la page affichée.

### Signals publics

| Signal | Description |
|---|---|
| `visiblePage` | Page courante |
| `totalRecords` | `computed(() => _localLocomotives().length)` |
| `loading` | Spinner |
| `editMode` | Mode édition |
| `pendingAdds` | Locomotives en attente d'ajout |
| `pendingRemovals` | `computed` : locomotives distantes marquées pour suppression |
| `pendingToRemoveIds` | `computed` : tableau des IDs (pour ngClass dans le template) |
| `pendingCount` | `computed` : total des changements en attente |
| `hasPendingChanges` | `computed` : vrai si pendingCount > 0 |

### Méthodes publiques

| Méthode | Rôle |
|---|---|
| `initialize()` | Charge le dataset distant initial |
| `loadPage(event)` | Lazy load depuis `_localLocomotives` |
| `enterEditMode()` | Active le mode édition |
| `addPending(l)` | Ajoute à `_pendingToAdd` (ID temporaire négatif) |
| `removeOrMarkForRemoval(id)` | Si id < 0 → cancel add / Si id > 0 → toggle mark |
| `save()` | Fusionne pending → état distant + exit edit mode |
| `discard()` | Annule pending + exit edit mode |

### Mécanique de `save()`

```typescript
save(): void {
  const toAdd = this._pendingToAdd();
  const toRemoveIds = this._pendingToRemoveIds();

  this._remoteLocomotives.update(list => {
    const afterRemovals = list.filter(l => !toRemoveIds.has(l.id));
    const maxId = Math.max(...afterRemovals.map(l => l.id), 0);
    const added = toAdd.map((l, i) =>
      new Locomotive(maxId + i + 1, l.series, l.manufacturer, l.year, l.type, l.country)
    );
    return [...afterRemovals, ...added];
  });

  this._clearPendingChanges();   // vide toAdd + toRemoveIds + reset counter
  this._editMode.set(false);
  this._refreshCurrentPage();
}
```

### Mécanique du Toggle de suppression

```typescript
removeOrMarkForRemoval(id: number): void {
  if (id < 0) {
    // Ajout local → suppression directe de la liste pending
    this._pendingToAdd.update(list => list.filter(l => l.id !== id));
  } else {
    // Item distant → toggle du Set (marquer / démarquer)
    this._pendingToRemoveIds.update(s => {
      const newSet = new Set(s); // OBLIGATOIRE : nouveau Set pour la réactivité Signal
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  }
  this._refreshCurrentPage();
}
```

> **Important** : ne jamais muter un `Set` in-place avec un signal Angular.
> Toujours créer une nouvelle instance pour déclencher la réactivité.

---

## 7) Composants UI

### 7.1 `LocomotivesListComponent` (version simple)

**Fichier** : `src/app/components/locomotives-list/`

- Dumb Component : `@Input` → `@Output` uniquement
- Table lazy PrimeNG avec colonne Actions conditionnelle (`@if editMode`)
- Tag PrimeNG coloré par type de traction (mapping `getTypeSeverity`)

### 7.2 `LocomotiveAddDropdownComponent` (partagé)

**Fichier** : `src/app/components/locomotive-add-dropdown/`

Flux en deux étapes :
1. "Générer 10" → `service.generateRandom(10)` → peuple le `p-select`
2. Sélection + "Ajouter" → `add.emit(loco)` → état local réinitialisé

Ce composant est **réutilisé** dans les deux pages (simple et complexe).

### 7.3 `LocomotivesComplexListComponent` (version complexe)

**Fichier** : `src/app/components/locomotives-complex-list/`

Différences par rapport à la version simple :

| Fonctionnalité | Simple | Complexe |
|---|---|---|
| Coloration des lignes pending | ✗ | ✓ vert/rouge via `ngClass` |
| Colonne "Statut" | ✗ | ✓ Tag Add/Remove/Saved |
| Bouton Supprimer | Suppression immédiate | Toggle marquage |
| Bouton Dé-marquer (undo) | ✗ | ✓ (re-clic ou pi-undo) |

Inputs supplémentaires :
```typescript
@Input() pendingToRemoveIds: number[] = []; // pour row--pending-remove
@Input() pendingToAddIds: number[]    = []; // pour row--pending-add
```

### 7.4 `LocomotivePendingPanelComponent` (version complexe)

**Fichier** : `src/app/components/locomotive-pending-panel/`

- Affiche deux listes : ajouts en attente / suppressions en attente
- Bouton d'annulation individuelle par item
- `@Output() cancelAdd` et `@Output() cancelRemoval`

---

## 8) Pages orchestratrices

### 8.1 `LocomotivesPage` (Smart, version simple)

Connecte les `@Output` des composants aux méthodes de `LocomotivesFacade`.
Les modifications sont **immédiatement** persistées dans l'état unique.

### 8.2 `LocomotivesComplexPage` (Smart, version complexe)

Connecte les composants à `LocomotivesComplexFacade`.

**Boutons d'action selon le mode** :

```
Mode normal  : [Mode Édition]
Mode édition : [Sauvegarder (badge: N)] [Annuler les modifications]
```

Le bouton "Sauvegarder" est **désactivé** (`[disabled]`) tant que `hasPendingChanges = false`.
Son badge affiche le nombre total de changements en attente.

Le `@if (facade.editMode())` dans le template détruit et recrée les composants
`app-locomotive-add-dropdown` et `app-locomotive-pending-panel` à chaque bascule,
garantissant la réinitialisation automatique de leur état local.

---

## 9) Flux de données bout-en-bout (version complexe)

### 9.1 Initialisation

```
LocomotivesComplexPage.ngOnInit()
  → facade.initialize()
    → service.getInitialDataset() → 100 Locomotive[]
    → _remoteLocomotives.set(100 items)
    (pas encore de tri — aucune page demandée)

PrimeNG p-table émet onLazyLoad (first=0, rows=10)
  → facade.loadPage(event)
    → _localLocomotives() = sort(remote + pendingToAdd)
    → service.getPage(0, 10, _localLocomotives())
    → _visiblePage.set(items[0..9]) — 10 premières locos triées par series
```

### 9.2 Ajout en mode édition

```
Clic "Générer 10" → generateRandom(10) → p-select peuplé
Sélection + "Ajouter"
  → add.emit(loco)
  → LocomotivesComplexPage.onAdd(loco)
  → facade.addPending(loco)
    → tempId = --_pendingIdCounter   (ex: -1)
    → _pendingToAdd.update([..., new Locomotive(-1, ...)])
    → _localLocomotives recomputed (fusion + tri)
    → _refreshCurrentPage() → service.getPage(...)
    → Ligne verte apparaît dans le tableau à la position alphabétique correcte
```

### 9.3 Marquage pour suppression (toggle)

```
Clic pi-trash sur une ligne distante (id = 42)
  → remove.emit(42)
  → facade.removeOrMarkForRemoval(42)
    → id > 0 → toggle Set
    → _pendingToRemoveIds.update(new Set([..., 42]))
    → _pendingRemovals recomputed
    → _pendingToRemoveIds recomputed (tableau)
    → Ligne rouge + tag "À supprimer" dans le tableau
    → Panneau pending : item dans la section "Suppressions"

Re-clic pi-undo sur la même ligne
  → toggle supprime 42 du Set
    → Ligne redevient normale
    → Panneau pending : item retiré
```

### 9.4 Sauvegarde

```
Clic "Sauvegarder"
  → facade.save()
    → _remoteLocomotives mis à jour (suppressions effectives + ajouts avec IDs permanents)
    → _pendingToAdd.set([])
    → _pendingToRemoveIds.set(new Set())
    → _editMode.set(false)
    → _refreshCurrentPage() → tableau recharge sans indicateurs pending
```

### 9.5 Annulation

```
Clic "Annuler les modifications"
  → facade.discard()
    → _pendingToAdd.set([])
    → _pendingToRemoveIds.set(new Set())
    → _editMode.set(false)
    → _refreshCurrentPage() → tableau restauré à l'état distant
```

---

## 10) Guide de reproduction

Pour créer une feature similaire (liste lazy éditable complexe) sur une autre entité :

### Étape 1 — Modèle
Classe domaine avec un champ servant au tri alphabétique (ex. `name`, `series`).
Convention : IDs négatifs = temporaires locaux.

### Étape 2 — Service mock
- `getInitialDataset()` : dataset déterministe
- `getPage(offset, size, currentDataset)` : lazy simulé
- `generateRandom(count)` : pour le dropdown

### Étape 3 — Facade complexe
Signals requis :
- `_remoteItems` : état distant (source de vérité persistée)
- `_pendingToAdd` : ajouts en attente
- `_pendingToRemoveIds` : Set des IDs à supprimer
- `_localItems = computed(...)` : fusion + tri
- `_pendingIdCounter` : compteur décrémental pour IDs temporaires

Méthodes clés : `initialize()`, `loadPage()`, `addPending()`, `removeOrMarkForRemoval()`, `save()`, `discard()`.

### Étape 4 — Composant liste complexe
Inputs supplémentaires : `pendingToRemoveIds`, `pendingToAddIds`.
Template : `[ngClass]` sur `<tr>` + colonne Statut conditionnelle.

### Étape 5 — Composant pending panel
`@Input() pendingAdds`, `@Input() pendingRemovals`.
`@Output() cancelAdd`, `@Output() cancelRemoval`.

### Étape 6 — Page Smart
Boutons différenciés selon `facade.editMode()`.
`@if (facade.editMode())` pour les composants d'édition (réinitialisation auto).

### Étape 7 — Routing + Navigation
Route lazy + bouton toolbar.

---

## 11) Points d'attention et limites

- **Persistance** : en mémoire uniquement — rechargement = retour aux 100 locos d'origine.
- **IDs temporaires** : les IDs négatifs ne doivent pas être utilisés côté serveur. En production, l'API assigne l'ID permanent lors du POST.
- **Set et réactivité Signal** : toujours créer un nouveau `Set` lors d'une mise à jour — la mutation in-place n'est pas détectée.
- **Tri et lazy** : le tri est appliqué sur le dataset complet avant pagination. En production, le tri côté serveur est géré via les paramètres de l'API (non implémenté ici).
- **Suppression marquée vs suppression réelle** : les items marqués pour suppression restent dans `_localLocomotives` jusqu'au `save()`. Le `totalRecords` les inclut donc.

---

## 12) Fichiers à consulter en priorité

**Version simple :**
- `src/app/views/locomotives-page/locomotives-page.ts`
- `src/app/states/locomotives.facade.ts`

**Version complexe :**
- `src/app/views/locomotives-complex-page/locomotives-complex-page.ts`
- `src/app/states/locomotives-complex.facade.ts`
- `src/app/components/locomotives-complex-list/locomotives-complex-list.component.ts`
- `src/app/components/locomotive-pending-panel/locomotive-pending-panel.component.ts`

**Partagés :**
- `src/app/core/models/locomotive.model.ts`
- `src/app/core/services/locomotive-mock.service.ts`
- `src/app/components/locomotive-add-dropdown/locomotive-add-dropdown.component.ts`
