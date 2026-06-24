# Documentation technique — Feature : Page Locomotives (Liste Lazy + Mode Édition)

## Liens associés
- Architecture générale du projet : `docs/architecture-et-mecaniques.md`
- Reactive Forms et CVA : `docs/reactive-forms-et-cva.md`

---

## 1) Objectif de la feature

Cette feature ajoute la page `/locomotives` au projet. Elle démontre deux mécaniques
complémentaires sur un tableau PrimeNG :

1. **Chargement lazy (pagination serveur simulée)** : seule la page courante est chargée,
   le reste reste en mémoire côté service et est tranché (`slice`) à la demande.

2. **Mode édition activable** : un bouton bascule active/désactive un état qui modifie
   dynamiquement le tableau (affichage d'une colonne Actions + d'un panneau d'ajout).

---

## 2) Fichiers créés

```
src/app/core/models/
  └── locomotive.model.ts               ← Modèle domaine + enum LocomotiveType

src/app/core/services/
  └── locomotive-mock.service.ts        ← Dataset 100 entrées + génération aléatoire

src/app/states/
  └── locomotives.facade.ts             ← Facade Signals (état + logique métier)

src/app/components/
  ├── locomotives-list/
  │   ├── locomotives-list.component.ts ← Composant présentation (table lazy)
  │   ├── locomotives-list.component.html
  │   └── locomotives-list.component.scss
  └── locomotive-add-dropdown/
      ├── locomotive-add-dropdown.component.ts ← Composant ajout (génération + dropdown)
      ├── locomotive-add-dropdown.component.html
      └── locomotive-add-dropdown.component.scss

src/app/views/locomotives-page/
  ├── locomotives-page.ts               ← Page orchestratrice (Smart Component)
  ├── locomotives-page.html
  └── locomotives-page.scss

docs/
  └── locomotives-lazy-editable-list.md ← Cette documentation
```

Fichiers modifiés :
- `src/app/app.routes.ts` → ajout de la route `/locomotives`
- `src/app/app.html` → ajout du bouton de navigation "Locomotives"

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
    public id: number,
    public series: string,       // ex. « BB 7200 »
    public manufacturer: string, // ex. « Alstom »
    public year: number,
    public type: LocomotiveType,
    public country: string,
  ) {}

  get key(): string { ... }        // clé unique pour PrimeNG dataKey
  get displayName(): string { ... } // « Série (Année) — Constructeur »
}
```

Le modèle est indépendant de tout format API/DTO. L'enum `LocomotiveType` évite
les chaînes magiques et permet un mapping de sévérité PrimeNG dans le composant liste.

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
Dataset = 100 locomotives générées via index cyclique :
  series       = SERIES_POOL[i % pool.length]
  manufacturer = MANUFACTURER_POOL[i % pool.length]
  year         = YEAR_MIN + (i * 7) % (YEAR_MAX - YEAR_MIN + 1)
  type         = TYPE_POOL[i % pool.length]
  country      = COUNTRY_POOL[i % pool.length]
```

Le coefficient `* 7` pour les années assure une distribution bien répartie
sur l'intervalle 1920–2024 même avec un petit pool.

### Mécanique du lazy (getPage)

```typescript
getPage(offset, size, currentDataset): Observable<{items, total}> {
  const items = currentDataset.slice(offset, offset + size);
  return of({ items, total: currentDataset.length }).pipe(delay(300));
}
```

**Important** : le dataset passé en paramètre est celui géré par la facade
(et non le dataset interne immuable). Cela permet de refléter les ajouts/suppressions
sans nécessiter une re-initialisation du service.

---

## 5) Facade : `LocomotivesFacade`

**Fichier** : `src/app/states/locomotives.facade.ts`

### Pattern utilisé

La facade implémente le pattern **Facade + Signals** :
- Un seul point d'entrée pour toute la logique métier de la page
- Exposition des signaux en lecture seule pour les composants
- Mutations uniquement via des méthodes publiques

### Signals internes

| Signal | Type | Rôle |
|---|---|---|
| `_allLocomotives` | `Locomotive[]` | Source de vérité complète (100 + ajouts) |
| `_visiblePage` | `Locomotive[]` | Page courante affichée dans le tableau |
| `_loading` | `boolean` | Spinner de chargement |
| `_editMode` | `boolean` | Mode édition actif/inactif |
| `_lastLazyEvent` | `TableLazyLoadEvent \| null` | Dernier événement lazy (pour refresh) |

### Signals publics exposés (lecture seule)

| Signal | Description |
|---|---|
| `visiblePage` | Données de la page courante |
| `totalRecords` | `computed(() => _allLocomotives().length)` |
| `loading` | Indicateur de chargement |
| `editMode` | Mode édition |

### Méthodes publiques

| Méthode | Rôle |
|---|---|
| `initialize()` | Charge le dataset initial depuis le service |
| `loadPage(event)` | Charge une page lazy (mémorise l'event) |
| `toggleEditMode()` | Bascule le mode édition |
| `addLocomotive(l)` | Ajoute + recalcule id + refresh page |
| `removeLocomotive(id)` | Supprime + refresh page |

### Mécanique de refresh après mutation

```typescript
// Mémorisation du dernier event pour permettre le refresh
private _lastLazyEvent: TableLazyLoadEvent | null = null;

loadPage(event: TableLazyLoadEvent): void {
  this._lastLazyEvent = event;  // mémorisé
  // ... chargement ...
}

private _refreshCurrentPage(): void {
  if (this._lastLazyEvent) {
    this.loadPage(this._lastLazyEvent); // re-joue avec le dataset muté
  }
}
```

---

## 6) Composant liste : `LocomotivesListComponent`

**Fichier** : `src/app/components/locomotives-list/`

### Pattern : Dumb/Presentational Component

Ce composant **ne connaît ni la facade ni le service**. Il reçoit toutes ses données
via `@Input` et communique vers le haut via `@Output`.

```
Inputs  : locomotives, totalRecords, loading, editMode
Outputs : lazyLoad (TableLazyLoadEvent), remove (number/id)
```

### Mode édition conditionnel

```html
<!-- Colonne visible uniquement en mode édition -->
@if (editMode) {
  <th>Actions</th>
}

<!-- Bouton Supprimer par ligne -->
@if (editMode) {
  <p-button icon="pi pi-trash" (onClick)="onRemove(loco.id)" />
}
```

Le `@if` permet un rendu conditionnel strict (pas de `*ngIf` avec `display:none`).

### Mapping type → sévérité PrimeNG

```typescript
getTypeSeverity(type: LocomotiveType): 'info' | 'warn' | 'secondary' {
  switch (type) {
    case LocomotiveType.ELECTRIC: return 'info';
    case LocomotiveType.DIESEL:   return 'warn';
    case LocomotiveType.STEAM:    return 'secondary';
  }
}
```

---

## 7) Composant dropdown : `LocomotiveAddDropdownComponent`

**Fichier** : `src/app/components/locomotive-add-dropdown/`

### Flux en deux étapes

```
Étape 1 → Clic "Générer 10 locomotives"
  → service.generateRandom(10)
  → generatedLocomotives.set(résultat)
  → selectedLocomotive.set(null)   // réinitialisation de la sélection

Étape 2 → Sélection dans p-select + clic "Ajouter"
  → add.emit(selectedLocomotive())
  → réinitialisation de l'état local (generatedLocomotives, selectedLocomotive)
```

### Signals locaux

```typescript
readonly generatedLocomotives = signal<Locomotive[]>([]);
readonly selectedLocomotive   = signal<Locomotive | null>(null);
```

Ces signals sont **purement locaux** à ce composant : ils ne remontent pas dans la facade.
L'ajout réel au dataset est fait par la facade après réception de l'`@Output`.

---

## 8) Page : `LocomotivesPage`

**Fichier** : `src/app/views/locomotives-page/`

### Pattern : Smart/Container Component

La page orchestre les composants enfants et connecte leurs événements à la facade :

```typescript
// Connexion événements → facade
onLazyLoad(event)    → facade.loadPage(event)
onRemove(id)         → facade.removeLocomotive(id)
onAdd(locomotive)    → facade.addLocomotive(locomotive)
onToggleEditMode()   → facade.toggleEditMode()
```

Les composants enfants sont complètement découplés de la facade.

### Affichage conditionnel du panneau d'ajout

```html
@if (facade.editMode()) {
  <app-locomotive-add-dropdown (add)="onAdd($event)" />
}
```

Le composant dropdown est **créé/détruit** selon le mode édition (pas juste caché),
ce qui réinitialise son état local automatiquement à chaque désactivation du mode.

---

## 9) Flux de données bout-en-bout

### 9.1 Chargement initial

```
LocomotivesPage.ngOnInit()
  → facade.initialize()
    → service.getInitialDataset()  → 100 Locomotive[]
    → _allLocomotives.set(100 items)

PrimeNG p-table émet onLazyLoad (first=0, rows=10)
  → LocomotivesPage.onLazyLoad(event)
  → facade.loadPage(event)
    → _lastLazyEvent = event
    → service.getPage(0, 10, allLocomotives)
      → Observable<{items[0..9], total: 100}>  (après 300 ms)
    → _visiblePage.set(items)
    → _loading.set(false)
  → Tableau affiche les 10 premières locomotives
```

### 9.2 Ajout d'une locomotive

```
Utilisateur clique "Générer 10 locomotives"
  → service.generateRandom(10) → 10 Locomotive aléatoires
  → generatedLocomotives.set(...)

Utilisateur sélectionne une locomotive dans p-select
  → selectedLocomotive.set(loco)

Utilisateur clique "Ajouter"
  → add.emit(selectedLocomotive())
  → LocomotivesPage.onAdd(loco)
  → facade.addLocomotive(loco)
    → nextId = max(ids) + 1
    → _allLocomotives.update(list => [toAdd, ...list])  // insertion en tête
    → _refreshCurrentPage()  // recharge la page courante
```

### 9.3 Suppression d'une locomotive

```
Utilisateur clique pi-trash sur une ligne
  → LocomotivesListComponent.onRemove(id)
  → remove.emit(id)
  → LocomotivesPage.onRemove(id)
  → facade.removeLocomotive(id)
    → _allLocomotives.update(list => list.filter(l => l.id !== id))
    → _refreshCurrentPage()
```

---

## 10) Guide de reproduction

Pour créer une feature similaire (liste lazy éditable) sur une autre entité :

### Étape 1 — Modèle
Créer `src/app/core/models/<entite>.model.ts` avec une classe et un éventuel enum.

### Étape 2 — Service mock
Créer `src/app/core/services/<entite>-mock.service.ts` avec :
- un dataset privé construit à l'init
- `getPage(offset, size, currentDataset): Observable<{items, total}>`
- `generateRandom(count): Entite[]`
- `getInitialDataset(): Entite[]`

### Étape 3 — Facade
Créer `src/app/states/<entite>s.facade.ts` avec :
- `_allItems = signal<Entite[]>([])`
- `_visiblePage = signal<Entite[]>([])`
- `_loading = signal(false)`
- `_editMode = signal(false)`
- `_lastLazyEvent` pour le refresh
- Méthodes : `initialize()`, `loadPage()`, `toggleEditMode()`, `addItem()`, `removeItem()`

### Étape 4 — Composant liste (Dumb)
Créer le composant avec uniquement `@Input` / `@Output`. Pas de dépendance sur la facade.

### Étape 5 — Composant dropdown (Dumb)
Créer le composant avec état local (signals) + un `@Output add`.

### Étape 6 — Page (Smart)
Créer la page qui injecte la facade et connecte les `@Output` des composants aux méthodes de la facade.

### Étape 7 — Routing + Navigation
Ajouter la route dans `app.routes.ts` (lazy `loadComponent`) et le bouton dans `app.html`.

---

## 11) Points d'attention et limites

- **Persistance** : le dataset est en mémoire uniquement. Un rechargement de page remet les 100 locomotives d'origine.
- **IDs après ajout** : les ids des locomotives ajoutées sont calculés localement (`max + 1`). En production, l'API retournerait l'id réel.
- **Génération aléatoire** : les locomotives générées par le dropdown proviennent des mêmes pools de données que le dataset initial. Des doublons de série/constructeur sont possibles.
- **Tri/filtre lazy** : le tableau est configurable pour le tri côté serveur (les events PrimeNG le supportent nativement) mais cette feature ne l'implémente pas pour rester focalisée sur l'édition.
