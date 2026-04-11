# Trouble #003 — UserAutocompleteDemoComponent : migration ngModel → FormControl interne

**Date** : 2026-04-11  
**Composant** : `src/app/components/user-autocomplete-demo/`  
**Statut** : ✅ Résolu

---

## Contexte

Le composant `UserAutocompleteDemoComponent` est un ControlValueAccessor (CVA) qui encapsule un `p-autocomplete` PrimeNG en mode `[multiple]="true"`.  
Il est utilisé dans le formulaire réactif de `DemoFormComponent` via :

```html
<app-user-autocomplete-demo formControlName="selectedLegacyUsers" />
```

## Problème

L'implémentation initiale utilisait **`ngModel`** (`FormsModule`) pour piloter le `p-autocomplete` interne :

```html
<p-autocomplete
  [(ngModel)]="selectedUsers"
  (onSelect)="onSelectionChange()"
  (onUnselect)="onSelectionChange()"
  [disabled]="isDisabled"
  ...
/>
```

### Symptômes observés

1. **Mélange FormsModule / ReactiveFormsModule** — Le CVA était consommé via `formControlName` (ReactiveFormsModule côté parent) mais piloté en interne via `ngModel` (FormsModule côté enfant). Ce mélange est une source connue de bugs subtils et de warnings Angular.
2. **Propagation manuelle fragile** — Chaque point de mutation (`onSelect`, `onUnselect`, `addTwoRandomUsers`, `clearAll`) devait appeler manuellement `this.onChange(...)` et `this.onTouched()`. Un oubli sur un chemin = le form parent est désynchronisé.
3. **`[disabled]` sur un `ngModel`** — Angular émet un warning quand `[disabled]` est utilisé directement sur un champ piloté par `ngModel`. La bonne pratique est de passer par `FormControl.disable()`.
4. **Double source de vérité** — `selectedUsers` (le tableau local) et l'état du CVA parent pouvaient diverger en cas de timing ou de `writeValue` tardif.

## Correctif appliqué

Remplacement complet de `ngModel` par un **`FormControl` interne** (`innerControl`) avec `ReactiveFormsModule`.

### Changements clés

| Avant (ngModel) | Après (FormControl interne) |
|---|---|
| `FormsModule` importé | `ReactiveFormsModule` importé |
| `selectedUsers: LegacyUser[] = []` | `readonly innerControl = new FormControl<LegacyUser[]>([], { nonNullable: true })` |
| `[(ngModel)]="selectedUsers"` | `[formControl]="innerControl"` |
| `(onSelect)="onSelectionChange()"` | Supprimé — `innerControl.valueChanges` propage automatiquement |
| `(onUnselect)="onSelectionChange()"` | Supprimé — idem |
| `[disabled]="isDisabled"` sur le template | `innerControl.disable()` / `innerControl.enable()` dans `setDisabledState()` |
| Appels manuels `onChange()`/`onTouched()` dans chaque méthode | Un seul `subscribe` sur `innerControl.valueChanges` dans le constructeur |
| `writeValue` écrit dans `selectedUsers` | `writeValue` appelle `innerControl.setValue(..., { emitEvent: false })` |

### Architecture résultante

```
Parent (DemoFormComponent)
  └── FormGroup
        └── selectedLegacyUsers: FormControl<LegacyUser[]>
              ↕ CVA bridge (writeValue / onChange)
              └── UserAutocompleteDemoComponent
                    └── innerControl: FormControl<LegacyUser[]>  ← source de vérité unique
                          ↕ [formControl]
                          └── p-autocomplete (PrimeNG)
```

### Détails techniques

1. **`innerControl.valueChanges`** (dans le constructeur) est l'unique point de propagation vers le parent :
   ```typescript
   this.innerControl.valueChanges
     .pipe(takeUntilDestroyed(this.destroyRef))
     .subscribe((value) => {
       this.onChange(value);
       this.onTouched();
     });
   ```

2. **`writeValue`** utilise `{ emitEvent: false }` pour éviter une boucle infinie (le parent écrit → le CVA ne re-propage pas vers le parent) :
   ```typescript
   writeValue(value: LegacyUser[] | null): void {
     this.innerControl.setValue(value ?? [], { emitEvent: false });
   }
   ```

3. **`setDisabledState`** pilote l'état disabled/enabled via le FormControl, ce qui désactive automatiquement le `p-autocomplete` sans binding template :
   ```typescript
   setDisabledState(isDisabled: boolean): void {
     this.isDisabled = isDisabled;
     isDisabled
       ? this.innerControl.disable({ emitEvent: false })
       : this.innerControl.enable({ emitEvent: false });
   }
   ```

4. **`addTwoRandomUsers` et `clearAll`** n'ont plus besoin d'appeler manuellement `onChange`/`onTouched` — le `setValue` du `innerControl` déclenche `valueChanges` qui s'en charge.

## Pattern recommandé (CVA avec PrimeNG)

Pour tout composant CVA qui encapsule un contrôle PrimeNG :

1. **Utiliser un `FormControl` interne** (pas `ngModel`) comme source de vérité unique.
2. **S'abonner à `valueChanges`** dans le constructeur pour propager vers `onChange`/`onTouched` — un seul point de propagation.
3. **`writeValue`** → `setValue(..., { emitEvent: false })` pour éviter les boucles.
4. **`setDisabledState`** → `disable()`/`enable()` sur le FormControl interne.
5. **`takeUntilDestroyed`** pour le nettoyage automatique de la subscription.
6. **Ne jamais mélanger** `FormsModule` et `ReactiveFormsModule` dans le même composant.

## Fichiers modifiés

- `src/app/components/user-autocomplete-demo/user-autocomplete-demo.component.ts`
- `src/app/components/user-autocomplete-demo/user-autocomplete-demo.component.html`

