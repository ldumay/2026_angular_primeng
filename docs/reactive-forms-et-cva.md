# Documentation technique - Reactive Forms et ControlValueAccessor (CVA)

## 1) Objectif
Ce document explique le fonctionnement des formulaires reactifs dans le projet, ainsi que l'integration du composant d'adresse base sur `ControlValueAccessor`.

Il est complementaire a :
- `docs/architecture-et-mecaniques.md`

## 2) Ou se situe le formulaire dans l'application
Le formulaire utilisateur est porte par :
- `src/app/components/user-form/user-form.component.ts`
- `src/app/components/user-form/user-form.component.html`

Le controle d'adresse reutilisable est porte par :
- `src/app/components/adress-control/address-control.component.ts`

La page qui orchestre l'ensemble est :
- `src/app/views/users-pages/users-page.component.ts`

## 3) Structure du Reactive Form
`UserFormComponent` declare un `FormGroup` avec 5 controles :
- `firstName` : `required`
- `lastName` : `required`
- `email` : `required` + `email`
- `password` : `required` + `minLength(8)` en creation
- `address` : objet adresse (alimente via le CVA)

Extrait logique (niveau conceptuel) :
- le composant initialise les controles avec des valeurs par defaut
- les validateurs sont attaches au moment de la declaration
- `submit()` appelle `markAllAsTouched()` pour afficher les erreurs

## 4) Cycle creation vs edition
Le mode est determine par `@Input() selectedUser`.

### 4.1 En edition (`selectedUser` non nul)
- `ngOnChanges` pre-remplit le formulaire via `patchValue`.
- Le mot de passe devient optionnel :
  - retrait de `required`
  - conservation de `minLength(8)`
- A la soumission :
  - si un nouveau mot de passe est saisi, il est utilise
  - sinon, le mot de passe existant est conserve

### 4.2 En creation (`selectedUser` nul)
- le formulaire est reset avec des valeurs vides
- le mot de passe redevient obligatoire (`required` + `minLength(8)`)
- a la soumission, le composant emet `create`

## 5) Evenements emis vers la page
`UserFormComponent` ne modifie pas directement l'etat global. Il emet des evenements :
- `create: EventEmitter<User>`
- `update: EventEmitter<User>`
- `remove: EventEmitter<User>`
- `resetSelection: EventEmitter<void>`

`UsersPageComponent` recoit ces evenements et les delegue a `UsersFacade`.

## 6) Validation et messages d'erreur
Dans `user-form.component.html`, les messages apparaissent quand un controle est `touched` et invalide.

Exemples :
- nom/prenom obligatoires
- email obligatoire puis format valide
- mot de passe obligatoire en creation
- mot de passe d'au moins 8 caracteres

Mecanique UX :
- les erreurs n'apparaissent pas immediatement au chargement
- elles apparaissent apres interaction ou tentative de soumission

## 7) Focus sur le CVA d'adresse
Le composant `AddressControlComponent` implemente `ControlValueAccessor` pour devenir un vrai controle Angular Forms.

Methodes CVA implementees :
- `writeValue(value)` : met a jour le formulaire interne sans reboucler (`emitEvent: false`)
- `registerOnChange(fn)` : memorise le callback parent pour remonter les changements
- `registerOnTouched(fn)` : memorise le callback parent pour l'etat touched
- `setDisabledState(isDisabled)` : active/desactive le formulaire interne

Propagation des valeurs :
- le composant ecoute `form.valueChanges`
- a chaque changement, il reconstruit un objet `Address`
- il appelle `onChange(address)` pour synchroniser le `FormControl` parent

## 8) Flux complet des donnees formulaire
1. L'utilisateur tape dans `UserFormComponent`.
2. Les controles Angular mettent a jour la valeur et la validite.
3. Pour `address`, c'est `AddressControlComponent` qui propage la valeur via `onChange`.
4. `submit()` construit un `User` (avec `Address`) et emet `create` ou `update`.
5. `UsersPageComponent` relaye vers `UsersFacade`.
6. `UsersFacade` met a jour les signals -> la liste se rafraichit.

## 9) Bonnes pratiques deja appliquees
- separation nette entre presentation (`components/`) et etat metier (`states/`)
- formulaire type et centralise
- changement dynamique des validateurs selon le mode creation/edition
- composant adresse reutilisable, encapsule et branchable par `formControlName`

## 10) Limites actuelles et ameliorations recommandees
- `registerOnTouched` est prepare mais pas encore declenche sur `blur` des inputs adresse.
- validations adresse minimales : pas de validateurs specifiques (`required`, format code postal, etc.).
- pas de messages d'erreur dedies pour les champs d'adresse.

Pistes d'amelioration :
- ajouter des handlers `(blur)` dans `AddressControlComponent` pour appeler `onTouched()`
- ajouter des validateurs sur les champs adresse
- exposer les erreurs adresse dans le template parent pour un retour utilisateur plus explicite

## 11) References rapides
- `src/app/components/user-form/user-form.component.ts`
- `src/app/components/user-form/user-form.component.html`
- `src/app/components/adress-control/address-control.component.ts`
- `src/app/views/users-pages/users-page.component.ts`
- `src/app/states/users.facade.ts`
