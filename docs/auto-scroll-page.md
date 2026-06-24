# Documentation technique — Feature : Page Auto-Scroll

## Liens associés
- Architecture générale du projet : `docs/architecture-et-mecaniques.md`
- Glossaire Angular / PrimeNG : `docs/glossaire-angular-primeng.md`

---

## 1) Objectif de la feature

Cette page démontre le concept d'**auto-scroll** dans une interface Angular + PrimeNG :

| Élément | Description |
|---|---|
| **Dropdown en haut** | Sélection rapide d'un objet parmi la liste complète |
| **Listbox à gauche** | Liste complète scrollable ; synchronisée avec le dropdown |
| **Formulaire à droite** | Affichage en lecture seule des données de l'objet sélectionné |

**Comportement clé** : choisir un élément dans le dropdown provoque un défilement automatique fluide (`smooth`) de la listbox jusqu'à l'élément correspondant, qui est simultanément sélectionné.

**Route** : `/auto-scroll`  
**Branche Git** : `feature/auto-scroll-page`

---

## 2) Fichiers créés / modifiés

### Nouveaux fichiers

```
src/app/core/mocks/
  └── locomotives.mock.ts               ← Dataset statique de 30 locomotives

src/app/views/auto-scroll-page/
  ├── auto-scroll-page.ts               ← Composant standalone (logique)
  ├── auto-scroll-page.html             ← Template (dropdown + listbox + formulaire)
  └── auto-scroll-page.scss             ← Styles BEM locaux
```

### Fichiers modifiés

```
src/app/app.routes.ts                   ← Route lazy-loaded /auto-scroll
src/app/app.html                        ← Bouton "Auto-Scroll" dans la toolbar
```

---

## 3) Architecture du composant

### Schéma de la page

```
┌─────────────────────────────────────────────────────┐
│  En-tête : titre + badge nombre de locomotives      │
│  Sous-titre explicatif du comportement attendu      │
├─────────────────────────────────────────────────────┤
│  p-select (dropdown de sélection rapide)            │
│  ↳ filtre intégré, déclencheur du scroll            │
├───────────────────────┬─────────────────────────────┤
│  p-listbox            │  Formulaire lecture seule   │
│  ┌─────────────────┐  │  ┌───────────────────────┐  │
│  │ BB 7200         │  │  │ Série       : BB 7200  │  │
│  │ BB 15000        │  │  │ Constructeur: Alstom   │  │
│  │ ← sélectionné  │  │  │ Année       : 1976     │  │
│  │ ...             │  │  │ Pays        : France   │  │
│  │ (scroll auto)   │  │  │ Type        : ⚡ Élec. │  │
│  └─────────────────┘  │  └───────────────────────┘  │
└───────────────────────┴─────────────────────────────┘
```

### Flux de données

```
Dropdown (p-select)
  │
  │ (onChange) → onDropdownSelect(loco)
  │                  │
  │                  ├─ selected.set(loco)       → Signal → formulaire se met à jour
  │                  ├─ listboxValue = loco      → p-listbox sélectionne l'item
  │                  └─ _scrollToSelected(loco)  → scroll DOM natif

Listbox (p-listbox)
  │
  │ (onChange) → onListboxSelect(loco)
  │                  │
  │                  ├─ selected.set(loco)       → Signal → formulaire se met à jour
  │                  └─ dropdownValue = loco     → p-select affiche l'item
```

---

## 4) Mécanisme d'auto-scroll

### Principe

Le scroll automatique repose sur l'API DOM native `scrollIntoView`. Aucune
bibliothèque tierce n'est utilisée.

### Étapes détaillées

1. **Capture des éléments DOM** : `@ViewChildren('listItem')` collecte dans une
   `QueryList<ElementRef>` toutes les références `#listItem` déclarées dans le
   template `ng-template` de la listbox.

2. **Calcul de l'index** : `Array.findIndex()` localise la position de la
   locomotive sélectionnée dans le tableau source.

3. **Scroll** : L'élément correspondant à cet index dans la `QueryList` reçoit
   l'appel `scrollIntoView({ behavior: 'smooth', block: 'nearest' })`.

4. **Délai de 50 ms** : Un `setTimeout` minimal laisse à Angular le temps de
   propager les changements d'état (notamment `listboxValue`) avant que le DOM
   ne soit interrogé.

### Code clé

```typescript
// auto-scroll-page.ts

@ViewChildren('listItem') listItems!: QueryList<ElementRef<HTMLElement>>;

private _scrollToSelected(loco: Locomotive): void {
  const index = this.locomotives.findIndex((l) => l.id === loco.id);
  if (index < 0) return;

  setTimeout(() => {
    const items = this.listItems?.toArray();
    if (!items || index >= items.length) return;
    items[index].nativeElement.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    });
  }, 50);
}
```

### Template — référence `#listItem`

```html
<!-- auto-scroll-page.html -->

<p-listbox ...>
  <ng-template let-loco pTemplate="item">
    <div #listItem class="auto-scroll-page__list-item">
      <!-- ... -->
    </div>
  </ng-template>
</p-listbox>
```

> **Note** : La variable template `#listItem` est placée sur l'élément racine
> du `ng-template` personnalisé de chaque item. PrimeNG instancie ce template
> pour chaque entrée de la liste, et Angular enregistre chaque référence dans
> la `QueryList` dans le même ordre que le tableau source.

---

## 5) État réactif (Angular Signals)

Le composant utilise les Signals Angular (introduits en Angular 16, stabilisés
en Angular 17+) pour la réactivité.

| Signal / Computed | Type | Rôle |
|---|---|---|
| `selected` | `Signal<Locomotive \| null>` | Locomotive sélectionnée (source de vérité) |
| `typeSeverity` | `computed()` | Sévérité PrimeNG `p-tag` selon le type de traction |
| `typeIcon` | `computed()` | Icône PrimeIcon selon le type de traction |

Le formulaire de détail utilise `@if (selected())` pour n'être rendu que
lorsqu'une sélection existe (évite les binding sur `null`).

---

## 6) Composants PrimeNG utilisés

| Composant | Module importé | Usage |
|---|---|---|
| `p-select` | `SelectModule` | Dropdown de sélection rapide avec filtre intégré |
| `p-listbox` | `ListboxModule` | Liste scrollable avec template personnalisé |
| `pInputText` | `InputTextModule` | Champs du formulaire en lecture seule |
| `p-tag` | `TagModule` | Badge coloré pour le type de traction |

### Configuration notable de `p-select`

```html
<p-select
  [filter]="true"
  filterPlaceholder="Rechercher…"
  [showClear]="true"
  (onChange)="onDropdownSelect($event.value)"
/>
```

- `[filter]="true"` : active un champ de recherche intégré dans le dropdown.
- `[showClear]="true"` : affiche un bouton ✕ pour réinitialiser la sélection.
- `(onChange)` : émis à chaque changement de valeur ; `$event.value` contient
  l'objet `Locomotive` sélectionné (ou `null` après un clear).

### Configuration notable de `p-listbox`

```html
<p-listbox
  [listStyle]="{ 'max-height': '420px', 'overflow-y': 'auto' }"
  (onChange)="onListboxSelect($event.value)"
>
  <ng-template let-loco pTemplate="item">
    <div #listItem ...>...</div>
  </ng-template>
</p-listbox>
```

- `[listStyle]` définit une hauteur max et active le scroll sur l'élément
  interne de PrimeNG.
- Le `ng-template` personnalisé permet de placer `#listItem` sur chaque ligne
  pour le mécanisme de scroll.

---

## 7) Données mock

Le fichier `src/app/core/mocks/locomotives.mock.ts` contient 30 locomotives
couvrant les trois types de traction (`ELECTRIC`, `DIESEL`, `STEAM`) et
plusieurs pays (France, Allemagne, Royaume-Uni, Suisse, Italie, États-Unis,
Chine, Brésil).

```typescript
// Exemple d'entrée
new Locomotive(1, 'BB 7200', 'Alstom', 1976, LocomotiveType.ELECTRIC, 'France'),
```

Le constructeur `Locomotive` est réutilisé directement depuis le modèle
domaine existant (`src/app/core/models/locomotive.model.ts`). Aucune
duplication de modèle n'est introduite.

---

## 8) Styles (BEM)

Les styles suivent la convention BEM (`Block__Element--Modifier`) cohérente
avec le reste du projet.

| Classe | Description |
|---|---|
| `.auto-scroll-page` | Bloc racine (flex-column, gap, padding) |
| `.auto-scroll-page__header` | En-tête avec titre et sous-titre |
| `.auto-scroll-page__dropdown-wrapper` | Conteneur du p-select avec label |
| `.auto-scroll-page__panel` | Grille CSS 2 colonnes (listbox + formulaire) |
| `.auto-scroll-page__list-wrapper` | Carte listbox avec header |
| `.auto-scroll-page__form-wrapper` | Carte formulaire avec header |
| `.auto-scroll-page__field` | Ligne de champ (label + input) |
| `.auto-scroll-page__empty` | État vide (aucune sélection) |

Le layout est responsive : en dessous de 768 px, la grille passe en
`grid-template-columns: 1fr` (empilement vertical).

---

## 9) Route et navigation

### Route ajoutée (`app.routes.ts`)

```typescript
{
  path: 'auto-scroll',
  loadComponent: () =>
    import('./views/auto-scroll-page/auto-scroll-page').then(
      (m) => m.AutoScrollPage,
    ),
},
```

La route est **lazy-loaded** : le bundle du composant n'est chargé que lors
du premier accès à `/auto-scroll`, conformément à la convention du projet.

### Bouton de navigation (`app.html`)

```html
<a pButton routerLink="/auto-scroll" label="Auto-Scroll" severity="info"></a>
```

Inséré **avant** le bouton `"Locomotives"` dans la toolbar.

---

## 10) Points d'attention et limites

| Point | Description |
|---|---|
| **QueryList et virtualisation** | Le mécanisme `@ViewChildren` + `scrollIntoView` suppose que tous les items sont dans le DOM. Si la liste était virtualisée (ex. `p-virtual-scroller`), il faudrait utiliser l'API de virtualisation native de PrimeNG. |
| **Délai setTimeout** | Le délai de 50 ms est minimal et empirique. Sur des machines lentes, augmenter à 100 ms peut être nécessaire. Une alternative plus robuste serait d'utiliser `AfterViewChecked` ou `ChangeDetectorRef.detectChanges()`. |
| **Accessibility** | Le scroll automatique peut dérouter les utilisateurs de lecteurs d'écran. En production, envisager d'ajouter un `aria-live="polite"` sur la zone de formulaire pour annoncer la nouvelle sélection. |
| **Sélection listbox** | PrimeNG `p-listbox` avec `[(ngModel)]` ne déclenche `(onChange)` que sur un clic utilisateur, pas lors d'une mise à jour programmatique. La synchronisation dropdown→listbox repose donc uniquement sur `listboxValue = loco` (binding) sans cycle infini. |
