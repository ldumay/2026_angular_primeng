Pour résoudre ton problème d'affichage des données ajoutées via la recherche et le bouton dans le champ de l'autocompletion PrimeNG (p-autocomplete) sous Angular 21, voici une solution robuste et fonctionnelle, inspirée des meilleures pratiques et des retours de la communauté :

### Problème identifié
- Tu veux que les objets sélectionnés via l'autocompletion **et** ceux ajoutés via un bouton (p-button) s'affichent correctement dans le champ de l'autocompletion, comme un ensemble cohérent.
- Par défaut, PrimeNG ne gère pas nativement l'affichage personnalisé des objets sélectionnés en mode single selection, sauf via des workarounds.

---

## Solution recommandée

### 1. Utiliser `field` et une méthode de transformation
PrimeNG permet de spécifier un champ `field` pour indiquer quelle propriété de l'objet doit être affichée dans le champ de l'autocompletion. Cependant, si tu veux afficher un texte personnalisé (par exemple, une combinaison de propriétés), tu peux utiliser une méthode getter dans ton composant.

#### Exemple de code :
```html
<p-autoComplete
    [(ngModel)]="selectedItem"
    [suggestions]="filteredItems"
    (completeMethod)="filterItems($event)"
    [field]="getSelectedItemName"
>
    <ng-template let-item pTemplate="item">
        <div>{{item.name}} ({{item.id}})</div>
    </ng-template>
</p-autoComplete>
<p-button
    label="Ajouter"
    (onClick)="addItem()"
></p-button>
```

```typescript
// Dans ton composant
selectedItem: any;
filteredItems: any[] = [];

getSelectedItemName(item: any): string {
    return item ? `${item.name} (${item.id})` : '';
}

addItem() {
    const newItem = { id: 42, name: 'Nouvel élément' };
    this.selectedItem = newItem;
    // Mise à jour de la liste si nécessaire
}
```

- **Explication** : La méthode `getSelectedItemName` est appelée par PrimeNG pour afficher le texte dans le champ de l'autocompletion. Elle permet de formater l'objet sélectionné comme tu le souhaites.

---

### 2. Gestion des objets ajoutés via le bouton
Pour que les objets ajoutés via le bouton s'affichent correctement, il suffit de mettre à jour `selectedItem` avec l'objet souhaité. PrimeNG utilisera alors la méthode `getSelectedItemName` pour afficher le texte formaté.

---

### 3. Cas avancé : Multiple selection
Si tu utilises le mode multiple, tu peux utiliser la propriété `p-autocomplete-token-label` pour personnaliser l'affichage des tokens sélectionnés :
```html
<p-autoComplete
    [(ngModel)]="selectedItems"
    [suggestions]="filteredItems"
    (completeMethod)="filterItems($event)"
    [multiple]="true"
    [field]="getSelectedItemName"
>
    <ng-template let-item pTemplate="item">
        <div>{{item.name}} ({{item.id}})</div>
    </ng-template>
    <ng-template let-item pTemplate="selectedItems">
        <div class="selected-item">{{item.name}} ({{item.id}})</div>
    </ng-template>
</p-autoComplete>
```

---

### 4. Workaround pour le mode single selection
Si tu veux un contrôle total sur l'affichage en mode single selection, tu peux aussi utiliser un `input` classique et masquer l'autocompletion, mais cela nécessite plus de code personnalisé.

---

## Pourquoi cette solution ?
- Elle est **maintenable** et **scalable**, car elle utilise les mécanismes natifs de PrimeNG.
- Elle permet d'afficher **n'importe quel format de texte** pour les objets sélectionnés, que ce soit via l'autocompletion ou le bouton.
- Elle est **compatible avec Angular 21 et PrimeNG 21**.

---

### Références utiles
- [StackOverflow : How to bind the value in p-autoComplete in angular](https://stackoverflow.com/questions/73643631/how-to-bind-the-value-in-p-autocomplete-in-angular)
- [PrimeNG AutoComplete Documentation](https://primeng.org/autocomplete)

---

Si tu veux que je t’aide à adapter cette solution à ton code existant ou à un cas d’usage spécifique, n’hésite pas à partager un extrait de ton code actuel !