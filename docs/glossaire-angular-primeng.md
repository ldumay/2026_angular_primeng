# Annexe — Glossaire technique : Angular, PrimeNG et patterns du projet

> Ce glossaire est une annexe de `docs/locomotives-lazy-editable-list.md`.  
> Il centralise les définitions des termes techniques utilisés dans la documentation  
> et dans les commentaires du code source du projet.

---

## Sommaire

1. [Concepts Angular](#1-concepts-angular)
2. [Réactivité : Signals et Observables](#2-réactivité--signals-et-observables)
3. [Formulaires Angular](#3-formulaires-angular)
4. [Composants et communication](#4-composants-et-communication)
5. [Concepts PrimeNG](#5-concepts-primeng)
6. [Patterns d'architecture](#6-patterns-darchitecture)
7. [Concepts spécifiques au projet](#7-concepts-spécifiques-au-projet)
8. [Termes TypeScript utilisés](#8-termes-typescript-utilisés)

---

## 1) Concepts Angular

### Component (Composant)
Brique de base de l'interface Angular. Associe un sélecteur HTML, un template (`.html`),
des styles (`.scss`) et une classe TypeScript. Dans ce projet, tous les composants sont
**standalone** (sans NgModule).

```typescript
@Component({
  selector: 'app-my-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-component.html',
})
export class MyComponent {}
```

---

### Standalone Component
Composant Angular qui déclare ses dépendances directement via `imports: []` au lieu
d'appartenir à un `NgModule`. Mode par défaut depuis Angular 17+. Utilisé dans tout
ce projet.

---

### Directive
Instruction qui modifie le comportement ou l'apparence d'un élément DOM sans créer
un nouveau composant. Exemples : `*ngIf`, `*ngFor` (directives structurelles),
`pButton` (directive PrimeNG qui stylise un `<a>` ou `<button>`).

---

### Injectable / Service
Classe décorée avec `@Injectable` que Angular injecte dans d'autres classes via
son système de DI (Dependency Injection). Utilisé pour la logique partagée
(accès API, données mock, facades).

```typescript
@Injectable({ providedIn: 'root' }) // singleton global
export class LocomotiveMockService { ... }
```

`providedIn: 'root'` crée une instance unique pour toute l'application.

---

### OnInit (`ngOnInit`)
Interface du lifecycle Angular. La méthode `ngOnInit()` est appelée une fois après
la création du composant et l'initialisation de ses `@Input`. Utilisée pour déclencher
le chargement initial des données (ex. `facade.initialize()`).

---

### OnChanges (`ngOnChanges`)
Interface du lifecycle Angular. La méthode `ngOnChanges(changes)` est appelée chaque
fois qu'un `@Input` change. Utilisée dans les formulaires pour pré-remplir les champs
lors de la sélection d'un utilisateur à éditer.

---

### Router / RouterLink
Module Angular de navigation SPA (Single Page Application). `[routerLink]` sur un
élément HTML génère une navigation sans rechargement de page.

```html
<a pButton routerLink="/locomotives" label="Locomotives"></a>
```

---

### Lazy Loading (Angular Router)
Chargement différé d'un composant de page. Avec `loadComponent`, Angular ne télécharge
le bundle JavaScript de la page que lorsque l'utilisateur navigue vers cette route.

```typescript
{
  path: 'locomotives',
  loadComponent: () =>
    import('./views/locomotives-page/locomotives-page')
      .then(m => m.LocomotivesPage),
}
```

---

### `@if` / `@for` / `@switch` (Control Flow)
Nouvelle syntaxe Angular 17+ pour la logique conditionnelle et itérative dans les
templates, remplaçant `*ngIf` et `*ngFor`. Avantage clé de `@if` : le composant
est **créé et détruit** (pas juste caché), ce qui réinitialise son état local.

```html
@if (facade.editMode()) {
  <app-locomotive-add-dropdown />
}
```

---

### `[ngClass]`
Directive permettant d'appliquer conditionnellement des classes CSS à un élément
en fonction d'expressions TypeScript.

```html
<tr [ngClass]="{
  'row--pending-add': getPendingStatus(loco.id) === 'add',
  'row--pending-remove': getPendingStatus(loco.id) === 'remove'
}">
```

---

## 2) Réactivité : Signals et Observables

### Signal (`signal<T>`)
Nouvelle primitive réactive d'Angular (introduite en Angular 17). Encapsule une valeur
et notifie automatiquement les consommateurs lors de sa mise à jour.

```typescript
const count = signal(0);      // création
count.set(5);                 // mise à jour complète
count.update(v => v + 1);     // mise à jour relative
count();                      // lecture (appel comme fonction)
```

Avantages vs RxJS : syntaxe plus simple, intégration native dans les templates Angular.

---

### `asReadonly()`
Retourne une version en lecture seule d'un signal. Utilisé dans les facades pour
exposer les signals internes sans permettre leur mutation externe.

```typescript
// Dans la facade (signal privé mutable)
private readonly _loading = signal(false);

// Signal public : lecture seule pour les composants
readonly loading = this._loading.asReadonly();
```

---

### `computed<T>()`
Signal dérivé dont la valeur est calculée automatiquement à partir d'autres signals.
Se recompute uniquement quand un de ses signals sources change (lazy + mémoïsé).

```typescript
// Recomputed automatiquement quand _remoteLocomotives ou _pendingToAdd changent
private readonly _localLocomotives = computed(() => {
  const merged = [...this._remoteLocomotives(), ...this._pendingToAdd()];
  return merged.sort((a, b) => a.series.localeCompare(b.series, 'fr'));
});
```

---

### Observable (`Observable<T>`)
Type de base de RxJS. Représente un flux de valeurs émises dans le temps.
Utilisé ici pour simuler des appels HTTP (via `of(...).pipe(delay(300))`).

```typescript
// Simulation d'un délai réseau
of({ items, total }).pipe(delay(300)) // retourne un Observable
```

Un Observable est **froid** par défaut : rien ne se passe tant qu'on ne `subscribe()`.

---

### `subscribe()`
Méthode qui active un Observable et récupère ses valeurs. Dans ce projet, utilisé
dans les facades pour traiter le résultat du service mock.

```typescript
this.service.getPage(offset, size, dataset).subscribe({
  next: ({ items }) => {
    this._visiblePage.set(items);
    this._loading.set(false);
  }
});
```

---

### `of()` / `delay()` (RxJS operators)
- `of(value)` : crée un Observable qui émet `value` immédiatement puis se complète.
- `delay(ms)` : opérateur pipeable qui retarde l'émission de `ms` millisecondes.

Ensemble, ils simulent une réponse HTTP avec latence réseau.

---

## 3) Formulaires Angular

### Reactive Forms
Approche de formulaire Angular où la structure est définie en TypeScript (`FormGroup`,
`FormControl`) plutôt que dans le template. Offre une meilleure testabilité et typage.

```typescript
this.form = this.fb.group({
  series: ['', Validators.required],
  year: [2024, Validators.min(1800)],
});
```

---

### `FormGroup` / `FormControl`
- `FormGroup` : conteneur de plusieurs `FormControl`.
- `FormControl` : représente un champ unique avec sa valeur et ses validations.

---

### ControlValueAccessor (CVA)
Interface Angular permettant à un composant personnalisé d'agir comme un contrôle
de formulaire natif (compatible `formControlName`). Implémentée via :
- `writeValue(value)` : reçoit la valeur depuis le parent
- `registerOnChange(fn)` : enregistre le callback de propagation
- `registerOnTouched(fn)` : enregistre le callback de touché
- `setDisabledState(isDisabled)` : synchronise l'état actif/désactivé

Voir `docs/reactive-forms-et-cva.md` pour le détail.

---

## 4) Composants et communication

### `@Input()`
Décorateur qui marque une propriété comme entrée externe d'un composant.
Permet au composant parent d'injecter des données vers l'enfant.

```typescript
@Input() editMode: boolean = false;
@Input() locomotives: Locomotive[] = [];
```

---

### `@Output()` / `EventEmitter`
Décorateur qui marque une propriété comme sortie du composant.
Permet à l'enfant de remonter des événements vers le parent.

```typescript
@Output() remove = new EventEmitter<number>(); // émet un id

// Dans le template parent :
<app-list (remove)="onRemove($event)" />
```

---

### Smart Component (Container)
Composant qui **connaît** les services/facades, orchestre le flux de données,
et délègue l'affichage à des Dumb Components. Les pages (`*-page`) sont des
Smart Components dans ce projet.

---

### Dumb Component (Presentational)
Composant qui ne connaît **aucun service ni facade**. Il reçoit ses données via
`@Input` et communique uniquement via `@Output`. Hautement réutilisable et testable.
Les composants dans `src/app/components/` sont des Dumb Components.

---

### `::ng-deep`
Pseudo-sélecteur CSS Angular permettant de cibler des éléments **dans les sous-composants**
(piercing l'encapsulation des styles). Utilisé ponctuellement pour surpasser les styles
internes de PrimeNG (ex. couleur de fond de ligne dans `p-table`).

> ⚠️ À utiliser avec parcimonie — peut créer des effets de bord stylistiques.

---

## 5) Concepts PrimeNG

### `p-table` / `TableModule`
Composant de tableau de données PrimeNG, riche en fonctionnalités :
pagination, tri, filtre, lazy loading, sélection, etc.

```html
<p-table [value]="data" [lazy]="true" (onLazyLoad)="loadData($event)" />
```

---

### Lazy Loading PrimeNG (`[lazy]="true"`)
Mode où PrimeNG délègue la pagination au développeur. À chaque changement de page,
l'événement `(onLazyLoad)` est émis avec `{ first, rows }` — l'offset et la taille
de page — que la facade utilise pour charger la bonne tranche de données.

---

### `TableLazyLoadEvent`
Interface TypeScript de PrimeNG décrivant l'événement de chargement lazy.

```typescript
interface TableLazyLoadEvent {
  first: number;   // index du premier élément (0-based)
  rows: number;    // nombre de lignes demandées
  sortField?: string;
  sortOrder?: number;
  filters?: { [key: string]: FilterMetadata[] };
  // ...
}
```

---

### `dataKey`
Propriété de `p-table` indiquant le champ utilisé comme clé unique par ligne.
Essentiel pour la sélection, le suivi de mutation et les animations. Dans ce projet : `dataKey="id"`.

---

### `paginatorPosition`
Propriété de `p-table` indiquant la position du paginator (`"top"`, `"bottom"`, `"both"`).

---

### `p-button` / `ButtonModule`
Composant bouton PrimeNG. Propriétés clés :
- `label` : texte affiché
- `icon` : classe d'icône PrimeIcons (`pi pi-trash`, `pi pi-save`, etc.)
- `severity` : variante de couleur (`primary`, `secondary`, `success`, `danger`, `warn`, `info`, `contrast`)
- `[outlined]` : version contour (sans fond plein)
- `[text]` : version sans bordure ni fond
- `[disabled]` : désactivé
- `badge` / `badgeSeverity` : badge numérique sur le bouton

---

### `p-tag` / `TagModule`
Badge textuel avec couleur sémantique. Utilisé ici pour le type de traction
et les statuts de ligne (À ajouter / À supprimer / Sauvegardé).

```html
<p-tag value="Électrique" severity="info" icon="pi pi-bolt" />
```

---

### `p-select` / `SelectModule`
Composant dropdown de sélection PrimeNG (remplace `p-dropdown` depuis PrimeNG 17+).
Propriétés : `[options]`, `optionLabel`, `placeholder`, `[disabled]`, `appendTo`.

---

### `pTooltip` / `TooltipModule`
Directive PrimeNG qui ajoute une info-bulle à n'importe quel élément.

```html
<p-button pTooltip="Supprimer cette locomotive" tooltipPosition="left" />
```

---

### PrimeFlex
Bibliothèque utilitaire CSS complémentaire à PrimeNG, inspirée de Bootstrap/Tailwind.
Fournit des classes de flex (`flex`, `gap-2`, `justify-content-end`, etc.).

---

### PrimeIcons
Bibliothèque d'icônes vectorielles de PrimeNG. Classes préfixées par `pi pi-`.
Exemples : `pi pi-trash`, `pi pi-save`, `pi pi-pencil`, `pi pi-refresh`.

---

### `@primeuix/themes` / Aura
Système de thème configurable de PrimeNG. Le thème `Aura` est utilisé dans ce projet.
Les variables CSS du thème (`--p-primary-color`, `--p-text-muted-color`, etc.) sont
utilisées dans les SCSS pour garantir la cohérence avec le thème choisi.

---

## 6) Patterns d'architecture

### Facade (pattern)
Couche intermédiaire qui expose une interface simplifiée vers les services sous-jacents.
Dans ce projet, les facades (`*Facade`) centralisent l'état de page via Angular Signals
et exposent des méthodes pour chaque action métier.

```
Composant → Facade (état + logique) → Service (données)
```

Avantages :
- Les composants ne connaissent pas les services
- L'état est centralisé et réutilisable
- Testable indépendamment

---

### DTO (Data Transfer Object)
Objet représentant le format de données tel qu'il arrive de l'API (brut).
Ne contient pas de logique métier. Dans ce projet : `UserApiDto`.

```typescript
// DTO : format brut de l'API
interface UserApiDto {
  name: { first: string; last: string };
  login: { uuid: string };
  // ...
}
```

---

### Mapper
Fonction ou classe qui convertit un DTO en modèle domaine.
Isole les composants du format de l'API.

```typescript
// Mapper : DTO → Modèle domaine
class UserMapper {
  static fromDto(dto: UserApiDto): User { ... }
}
```

---

### Modèle domaine (Model)
Classe représentant un concept métier de l'application, indépendamment du format API.
Dans ce projet : `User`, `Locomotive`, `Car`, `Address`.

---

### État local vs distant
Distinction fondamentale de la version complexe :

| | État local | État distant |
|---|---|---|
| **Représente** | Modifications en cours | Données « sauvegardées » |
| **Signal** | `_pendingToAdd`, `_pendingToRemoveIds` | `_remoteLocomotives` |
| **Modifié par** | `addPending()`, `removeOrMarkForRemoval()` | `save()` uniquement |
| **Visible dans le tableau** | ✓ (avec indicateurs) | ✓ (sans indicateurs) |

---

### Pending Changes (modifications en attente)
Ensemble des modifications accumulées localement avant une action de sauvegarde explicite.
Permet d'annuler ou de réviser les changements avant leur persistance.

Dans ce projet, les pending changes sont :
- `_pendingToAdd` : locomotives à ajouter
- `_pendingToRemoveIds` : IDs de locomotives à supprimer

---

### Toggle Pattern
Comportement où une action bascule entre deux états opposés.
Exemples dans ce projet :
- `toggleEditMode()` : active/désactive le mode édition (version simple)
- `removeOrMarkForRemoval()` : marque/démarque une suppression (version complexe)

---

### Dataset déterministe
Jeu de données généré de manière **reproductible** : les mêmes paramètres d'entrée
produisent toujours le même résultat. Utilisé ici pour le dataset initial des 100
locomotives via un calcul basé sur l'index (`SERIES_POOL[i % pool.length]`).

---

## 7) Concepts spécifiques au projet

### ID temporaire négatif
Convention utilisée dans la version complexe pour identifier les locomotives en attente
d'ajout (non encore sauvegardées). Les IDs sont décrémentés à chaque ajout : −1, −2, …

```typescript
private _pendingIdCounter = 0;
const tempId = --this._pendingIdCounter; // -1, puis -2, etc.
```

Lors du `save()`, des IDs positifs permanents leur sont assignés
(`maxId + i + 1` dans le dataset distant).

---

### Refresh de page courante (`_refreshCurrentPage`)
Méthode interne des facades qui rejoue le dernier événement lazy mémorisé
(`_lastLazyEvent`) après une mutation du dataset.

```typescript
private _refreshCurrentPage(): void {
  if (this._lastLazyEvent) {
    this.loadPage(this._lastLazyEvent); // rejoue avec le dataset muté
  }
}
```

Sans cette mécanique, la vue ne se mettrait à jour qu'au prochain changement de page.

---

### Tri alphabétique dans `computed`
Le signal `_localLocomotives` est un `computed` qui trie automatiquement la fusion
du dataset distant et des ajouts locaux. Ce tri est déclenché par la réactivité Angular
à chaque mutation des signals sources.

```typescript
return merged.sort((a, b) =>
  a.series.localeCompare(b.series, 'fr', { sensitivity: 'base' })
);
```

`localeCompare` avec locale `'fr'` et `sensitivity: 'base'` ignore la casse et les accents.

---

### Mode édition (Edit Mode Pattern)
Signal booléen `_editMode` qui pilote l'affichage conditionnel dans le template.
Version simple : toggle (on/off) sans sauvegarde explicite.
Version complexe : activation uniquement (`enterEditMode()`), sortie via `save()` ou `discard()`.

---

## 8) Termes TypeScript utilisés

### `readonly`
Modificateur TypeScript qui empêche la réaffectation d'une variable après initialisation.
Utilisé pour les signals privés des facades.

```typescript
private readonly _editMode = signal(false); // ne peut pas être = autre chose
```

---

### `Set<T>`
Collection TypeScript de valeurs **uniques** sans doublon. Dans ce projet, utilisée
pour `_pendingToRemoveIds` : garantit qu'un même ID ne peut pas être marqué deux fois.

> ⚠️ Avec les signals Angular, ne jamais muter un Set in-place.
> Toujours créer une nouvelle instance pour déclencher la réactivité :
> ```typescript
> this._pendingToRemoveIds.update(s => {
>   const newSet = new Set(s); // nouveau Set = signal triggered
>   newSet.add(id);
>   return newSet;
> });
> ```

---

### `interface`
Contrat TypeScript définissant la forme d'un objet sans implémenter de logique.
Utilisé pour les types intermédiaires comme `PendingChanges` (interne à la facade complexe).

---

### `enum`
Type TypeScript qui associe des noms symboliques à des valeurs constantes.
Utilisé pour `LocomotiveType` : évite les chaînes magiques et permet l'autocomplétion.

```typescript
enum LocomotiveType {
  ELECTRIC = 'Électrique', // valeur string directement affichable
  DIESEL   = 'Diesel',
  STEAM    = 'Vapeur',
}
```

---

### `Array.from({ length: N }, (_, i) => ...)`
Idiome JavaScript pour créer un tableau de `N` éléments générés via une fonction.
Utilisé dans `LocomotiveMockService.buildDataset()`.

```typescript
Array.from({ length: 100 }, (_, i) => new Locomotive(i + 1, ...))
// → [Locomotive(1), Locomotive(2), ..., Locomotive(100)]
```

---

### `localeCompare()`
Méthode JavaScript de comparaison de chaînes sensible à la locale (langue).
Retourne un nombre négatif, zéro ou positif selon l'ordre alphabétique.
Utilisée pour le tri des locomotives (`a.series.localeCompare(b.series, 'fr')`).

---

### `slice(start, end)`
Méthode Array qui retourne un sous-tableau sans modifier le tableau original.
Utilisée dans `LocomotiveMockService.getPage()` pour extraire une page de données.

```typescript
currentDataset.slice(offset, offset + size) // → page courante
```

---

*Glossaire maintenu dans `docs/glossaire-angular-primeng.md`*  
*Documentation principale : `docs/locomotives-lazy-editable-list.md`*
