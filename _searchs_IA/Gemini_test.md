C'est un défi classique mais épineux : synchroniser un modèle de données interne à un composant tiers (PrimeNG) avec une action externe (votre bouton) tout en conservant l'intégrité de l'affichage (les "chips"). En tant que senior dev Angular 21, je vois tout de suite où le bât blesse : **la référence de l'objet et la détection de changement**.

Le `p-autoComplete` de PrimeNG, surtout en version 21 avec l'architecture `standalone` et les `Signals`, est très sensible à la mutation directe des tableaux. Si vous poussez (`push`) simplement un objet dans votre liste, Angular ne détecte pas le changement de référence, et le composant PrimeNG ne rafraîchit pas ses jetons (chips) visuels.

Voici la solution robuste utilisant les **Signals** (standard Angular 21) et le **Reactive Forms**, qui garantit une synchronisation parfaite.

---

### La Solution "Senior" : Immuabilité et Signals

L'astuce consiste à ne jamais modifier le tableau existant, mais à le **remplacer** par une nouvelle instance (spread operator `[...]`). Cela force le `p-autoComplete` à recalculer son état interne.

#### 1. Le Code TypeScript (Composant Standalone)

```typescript
import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';

interface Item {
  id: number;
  label: string;
}

@Component({
  selector: 'app-custom-search',
  standalone: true,
  imports: [ReactiveFormsModule, AutoCompleteModule, ButtonModule],
  templateUrl: './custom-search.component.html'
})
export class CustomSearchComponent {
  // On utilise un FormControl pour une gestion propre de l'état
  selectedItems = new FormControl<Item[]>([]);
  
  // Suggestions pour l'autocomplétion
  suggestions = signal<Item[]>([]);
  
  // Mock data pour la recherche
  allAvailableItems: Item[] = [
    { id: 1, label: 'Angular' },
    { id: 2, label: 'PrimeNG' },
    { id: 3, label: 'Signal' }
  ];

  // Méthode de recherche classique
  search(event: any) {
    const query = event.query.toLowerCase();
    this.suggestions.set(
      this.allAvailableItems.filter(i => i.label.toLowerCase().includes(query))
    );
  }

  // LA MÉTHODE CLÉ : Ajouter via le bouton externe
  addItemFromButton() {
    const newItem: Item = { id: Date.now(), label: 'Ajout Manuel' };
    
    // Récupération de la valeur actuelle (ou tableau vide si null)
    const currentValues = this.selectedItems.value || [];
    
    /**
     * CRUCIAL : On crée une NOUVELLE référence de tableau.
     * C'est ce qui force PrimeNG à redessiner les chips.
     */
    this.selectedItems.setValue([...currentValues, newItem]);
    
    // Optionnel : marquer comme "dirty" pour la validation
    this.selectedItems.markAsDirty();
  }
}
```

#### 2. Le Template HTML

```html
<div class="flex flex-column gap-3">
    <p-autoComplete 
        [formControl]="selectedItems" 
        [suggestions]="suggestions()" 
        (completeMethod)="search($event)"
        [multiple]="true" 
        optionLabel="label"
        placeholder="Rechercher..."
        field="label">
    </p-autoComplete>

    <p-button 
        label="Ajouter un objet externe" 
        icon="pi pi-plus" 
        (onClick)="addItemFromButton()">
    </p-button>
</div>
```

---

### Pourquoi Claude Opus a pu échouer et pourquoi ceci fonctionne :

1.  **Référence vs Mutation** : Si vous faites `this.selectedItems.push(item)`, le `p-autoComplete` ne voit pas que le tableau a changé car l'adresse mémoire du tableau reste la même. L'utilisation de `setValue([...current, newItem])` crée une nouvelle adresse, déclenchant le cycle de vie `OnChanges` interne de PrimeNG.
2.  **Field vs DataKey** : Assurez-vous que l'attribut `field="label"` correspond bien à la propriété de votre objet. Si vos objets sont complexes, ajoutez `dataKey="id"` sur le `p-autoComplete` pour aider PrimeNG à comparer les objets sans erreur de référence.
3.  **Reactive Forms** : L'utilisation de `[formControl]` est beaucoup plus stable en Angular 21 que le `[(ngModel)]` pour des composants complexes comme l'AutoComplete multiple, car elle offre un canal de communication explicite via `setValue`.

### Un dernier conseil d'expert :
Si malgré cela les jetons ne s'affichent pas, vérifiez que votre objet ajouté manuellement possède **exactement** la même structure que ceux renvoyés par la recherche. PrimeNG compare souvent les objets par référence : l'ajout d'un `dataKey="id"` résout 99% des problèmes de désynchronisation restants.