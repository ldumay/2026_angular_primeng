Tu touches ici un **problème classique mais non trivial** avec Angular + PrimeNG :
👉 synchroniser **une source de vérité unique** entre :

* un `p-autoComplete`
* un `p-button`
* un modèle d’objets complexe (array)

Et surtout : **afficher correctement cette même source dans l’input**.

---

# 🔥 Diagnostic (niveau senior)

Le problème vient presque toujours de **3 points structurels** :

### 1. ❌ Mauvais binding du modèle

`p-autocomplete` attend :

* un **objet** (mode simple)
* ou un **array d’objets** si `multiple=true`

👉 Si tu ajoutes via bouton + autocomplete → il faut **UNE SEULE référence array**

Sinon :

* Angular ne détecte pas les changements
* PrimeNG ne met pas à jour l’affichage

👉 PrimeNG repose sur `ngModel` ou `FormControl` comme **source unique** ([PrimeNG][1])

---

### 2. ❌ Problème d’identité d’objet (très fréquent)

Même si les données sont "identiques", Angular compare par **référence mémoire**

➡️ Résultat :

* ajout via bouton → objet différent
* autocomplete → objet différent
* affichage KO

👉 Angular fournit `compareWith` pour ça ([Angular][2])

---

### 3. ❌ PrimeNG a des bugs / limitations connues

* `[object Object]` affiché
* chip vide avec `optionValue`
* mauvais rendu en `multiple`
  ([GitHub][3])

👉 Donc il faut structurer proprement le binding

---

# ✅ Solution robuste (architecture recommandée)

## 🧠 Principe clé

👉 **Un seul state immutable = source de vérité**

```ts
selectedItems: MyType[] = [];
```

---

## ✅ Template (critique)

```html
<p-autoComplete
  [(ngModel)]="selectedItems"
  [suggestions]="filteredItems"
  (completeMethod)="search($event)"
  optionLabel="name"
  [multiple]="true"
  [forceSelection]="false">
</p-autoComplete>

<button pButton (click)="addItem()">Add</button>
```

👉 Important :

* `multiple=true` → obligatoire pour gérer une liste ([GeeksforGeeks][4])
* `optionLabel` → pour affichage correct

---

## ✅ Ajout via bouton (clé du problème)

```ts
addItem() {
  const newItem = this.buildItem();

  // ⚠️ IMMUTABLE UPDATE (CRUCIAL)
  this.selectedItems = [...this.selectedItems, newItem];
}
```

👉 **Jamais :**

```ts
this.selectedItems.push(newItem); // ❌ casse le change detection
```

---

## ✅ Normalisation (anti-bug PrimeNG)

Toujours garantir :

```ts
selectedItems: MyType[] = [];
```

👉 jamais :

* `null`
* `""`
* `undefined`

➡️ sinon PrimeNG crash ou ne render pas ([GitHub][5])

---

## ✅ (OPTION MAIS PROPRE) compareWith

Si objets complexes :

```html
<p-autoComplete
  ...
  [compareWith]="compareFn">
</p-autoComplete>
```

```ts
compareFn = (a: MyType, b: MyType) => a?.id === b?.id;
```

👉 indispensable si :

* données API
* objets recréés

---

# 🧠 Solution PRO (niveau senior Angular)

👉 Le vrai clean : **ControlValueAccessor**

Créer ton composant :

```ts
export class MyAutocompleteComponent implements ControlValueAccessor {
  value: MyType[] = [];

  writeValue(val: MyType[]) {
    this.value = val || [];
  }

  onChange = (val: MyType[]) => {};

  add(item: MyType) {
    this.value = [...this.value, item];
    this.onChange(this.value);
  }
}
```

👉 Pourquoi ?

* Synchronisation parfaite
* Compatible Reactive Forms
* évite double state interne/externe ([Stack Overflow][6])

---

# ⚠️ Pièges critiques à éviter

### ❌ Double state

```ts
autoCompleteValue = [];
buttonValue = [];
```

➡️ DOIT être UNIFIÉ

---

### ❌ Mutation directe

```ts
array.push()
```

➡️ Angular ne détecte pas

---

### ❌ Mauvais type

```ts
selectedItems = "";
```

➡️ casse `multiple=true`

---

### ❌ optionValue mal utilisé

➡️ peut casser l’affichage (bug connu PrimeNG)

---

# 🧩 Résumé opérationnel

👉 Pour que ça marche à 100% :

1. `multiple=true`
2. modèle = `MyType[]`
3. **immutable update obligatoire**
4. `optionLabel` défini
5. éventuellement `compareWith`
6. idéalement → `ControlValueAccessor`

---

# 🚀 Conclusion (vision senior)

Ton problème n’est pas un bug isolé :

👉 C’est un **problème de gestion d’état + identité objet + change detection Angular**

La solution optimale :

* **state unique**
* **immutabilité**
* **contrôle du binding**

---

Si tu veux, envoie ton code actuel (TS + HTML) → je te fais une **correction ciblée type review senior + diff Git**.

[1]: https://v19.primeng.org/autocomplete?utm_source=chatgpt.com "Angular AutoComplete Component"
[2]: https://v19.angular.dev/api/forms/SelectMultipleControlValueAccessor?utm_source=chatgpt.com "SelectMultipleControlValueAccessor • Angular"
[3]: https://github.com/primefaces/primeng/issues/15495?utm_source=chatgpt.com "Component: p-autocomplete wrong display of chip if multiple=true and optionValue and optionLabel is set · Issue #15495 · primefaces/primeng · GitHub"
[4]: https://www.geeksforgeeks.org/angular-primeng-form-autocomplete-multiple-selection-component/?utm_source=chatgpt.com "Angular PrimeNG Form AutoComplete Multiple Selection Component - GeeksforGeeks"
[5]: https://github.com/primefaces/primeng/issues/16409?utm_source=chatgpt.com "Component: p-autocomplete [primeng v18] · Issue #16409 · primefaces/primeng · GitHub"
[6]: https://stackoverflow.com/questions/41488335/angular2-data-binding-for-primeng-autocomplete-component?utm_source=chatgpt.com "angular - Angular2 Data binding for Primeng autocomplete component - Stack Overflow"
