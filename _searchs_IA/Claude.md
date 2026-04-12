J'ai maintenant une analyse complète du problème. Voici le diagnostic précis et la solution senior.

---

## 🔍 Diagnostic du problème

Le bug classique d'Opus et de beaucoup de développeurs : **PrimeNG `p-autocomplete` en mode `multiple` ne réagit pas au `push()` sur un tableau existant**. Angular ne détecte pas le changement car **la référence du tableau reste identique** — donc le composant ne se re-render pas.

PrimeNG utilise par défaut un setter-based change detection : pour déclencher la mise à jour du composant, il faut **toujours créer une nouvelle référence de tableau** plutôt que de muter l'existant — utiliser le spread operator (`[...arr, item]`) au lieu de `push()`.

---

## ✅ Solution complète — composant standalone Angular 21 / PrimeNG 21

### Template HTML

```html
<!-- autocomplete-selector.component.html -->
<div class="flex gap-2 align-items-center">
  <p-autocomplete
    [(ngModel)]="selectedItems"
    [suggestions]="suggestions"
    (completeMethod)="onSearch($event)"
    optionLabel="label"
    [multiple]="true"
    placeholder="Rechercher..."
    class="flex-1"
  />

  <p-button
    icon="pi pi-plus"
    label="Ajouter"
    [disabled]="!pendingItem"
    (onClick)="addItemFromButton()"
  />
</div>
```

### Composant TypeScript

```typescript
// autocomplete-selector.component.ts
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutoCompleteModule, AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';

interface Item {
  id: number;
  label: string;
}

@Component({
  selector: 'app-autocomplete-selector',
  standalone: true,
  imports: [CommonModule, FormsModule, AutoCompleteModule, ButtonModule],
  templateUrl: './autocomplete-selector.component.html',
})
export class AutocompleteSelectorComponent {

  // Source de données
  private allItems: Item[] = [
    { id: 1, label: 'Angular' },
    { id: 2, label: 'PrimeNG' },
    { id: 3, label: 'TypeScript' },
    { id: 4, label: 'RxJS' },
    { id: 5, label: 'Signals' },
  ];

  // Suggestions filtrées affichées dans le dropdown
  suggestions: Item[] = [];

  // ✅ CLEF : tableau initialisé vide, jamais muté — toujours réassigné
  selectedItems: Item[] = [];

  // Item pré-sélectionné via le bouton (ex: valeur courante d'un autre composant)
  pendingItem: Item | null = { id: 99, label: 'Item par défaut' };

  onSearch(event: AutoCompleteCompleteEvent): void {
    const query = event.query.toLowerCase();
    this.suggestions = this.allItems.filter(item =>
      item.label.toLowerCase().includes(query)
    );
  }

  addItemFromButton(): void {
    if (!this.pendingItem) return;

    // Éviter les doublons
    const alreadyExists = this.selectedItems.some(i => i.id === this.pendingItem!.id);
    if (alreadyExists) return;

    // ✅ SOLUTION : spread operator → nouvelle référence → détection du changement
    this.selectedItems = [...this.selectedItems, this.pendingItem];
  }

  removeItem(item: Item): void {
    // Même logique pour la suppression
    this.selectedItems = this.selectedItems.filter(i => i.id !== item.id);
  }
}
```

---

## 🧠 Pourquoi ça échoue avec `push()`

```typescript
// ❌ MAUVAIS — Angular / PrimeNG ne voit pas le changement
this.selectedItems.push(newItem);

// ✅ BON — nouvelle référence, setter déclenché, UI mise à jour
this.selectedItems = [...this.selectedItems, newItem];
```

| Méthode | Référence | Change Detection | Résultat |
|---|---|---|---|
| `.push()` | Identique ❌ | Pas de setter | UI figée |
| `[...arr, item]` | Nouvelle ✅ | Setter déclenché | UI mise à jour |
| `.slice()` + assign | Nouvelle ✅ | Setter déclenché | UI mise à jour |

---

## 🎯 Pattern alternatif : Signal (Angular 17+)

Pour une approche plus moderne et réactive :

```typescript
selectedItems = signal<Item[]>([]);

addItemFromButton(): void {
  if (!this.pendingItem) return;
  const exists = this.selectedItems().some(i => i.id === this.pendingItem!.id);
  if (!exists) {
    this.selectedItems.update(items => [...items, this.pendingItem!]);
  }
}
```

Et dans le template, `[(ngModel)]` doit être adapté avec un getter/setter wrappant le signal, car `p-autocomplete` attend une valeur directe et non un Signal.

---

## 📚 Sources & apprentissage

- [PrimeNG AutoComplete — doc officielle](https://primeng.org/autocomplete) — section *Multiple*, propriété `immutable`
- [GitHub Issue #3641](https://github.com/primefaces/primeng/issues/3641) — "ngModel programatically doesn't update input"
- [GitHub Issue #18760](https://github.com/primefaces/primeng/issues/18760) — `selectedItem` template broken en `multiple=false` (bug actif PrimeNG 20+)
- **Concept clé** : [Angular Change Detection — Immutability Pattern](https://angular.dev/guide/change-detection)