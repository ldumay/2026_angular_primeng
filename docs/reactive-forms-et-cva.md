# Documentation technique - Reactive Forms et ControlValueAccessor (CVA)

## 1) Objectif
Ce document explique le fonctionnement des formulaires reactifs dans le projet, ainsi que l'integration des composants CVA (adresse, profession, genre et voiture).

Il est complementaire a :
- `docs/architecture-et-mecaniques.md`

## 2) Ou se situe le formulaire dans l'application
Le formulaire utilisateur est porte par :
- `src/app/components/user-form/user-form.component.ts`
- `src/app/components/user-form/user-form.component.html`

Le controle d'adresse reutilisable est porte par :
- `src/app/components/adress-control/address-control.component.ts`

Le controle de profession reutilisable est porte par :
- `src/app/components/profession-select-control/profession-select-control.component.ts`

Le controle de genre reutilisable est porte par :
- `src/app/components/gender-select-control/gender-select-control.component.ts`

Le controle de voiture reutilisable est porte par :
- `src/app/components/car-select-control/car-select-control.component.ts`

La source de donnees mockees des professions est :
- `src/app/core/services/profession-mock.service.ts`

La source de donnees mockees des voitures est :
- `src/app/core/services/car-mock.service.ts`

La page qui orchestre l'ensemble est :
- `src/app/views/users-pages/users-page.component.ts`

## 3) Structure du Reactive Form
`UserFormComponent` declare un `FormGroup` avec 8 controles :
- `firstName` : `required`
- `lastName` : `required`
- `email` : `required` + `email`
- `password` : `required` + `minLength(8)` en creation
- `profession` : `required` (valeur issue du composant PrimeNG `p-select` via CVA)
- `gender` : `required` (valeur issue du composant CVA genre)
- `car` : `required` (instance `Car` issue du composant CVA voiture)
- `address` : objet adresse (alimente via le CVA)

Extrait logique (niveau conceptuel) :
- le composant initialise les controles avec des valeurs par defaut
- les validateurs sont attaches au moment de la declaration
- `submit()` appelle `markAllAsTouched()` pour afficher les erreurs

## 4) Cycle creation vs edition
Le mode est determine par `@Input() selectedUser`.

### 4.1 En edition (`selectedUser` non nul)
- `ngOnChanges` pre-remplit le formulaire via `patchValue`.
- Le bouton `Dupliquer` est affiche et permet de creer un nouvel utilisateur a partir des valeurs courantes du formulaire.
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

Le bouton `Dupliquer` emet egalement `create` avec un nouvel utilisateur (ID vide cote formulaire, regenere par la facade).

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
- la duplication suit les memes regles de validation que la creation/mise a jour

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

## 8) Focus sur le CVA de profession
Le composant `ProfessionSelectControlComponent` implemente `ControlValueAccessor` pour encapsuler un champ de selection de profession base sur PrimeNG (`p-select`).

Methodes CVA implementees :
- `writeValue(value)` : met a jour la valeur selectionnee
- `registerOnChange(fn)` : remonte la profession selectionnee
- `registerOnTouched(fn)` : remonte le touched lors du blur
- `setDisabledState(isDisabled)` : desactive/active le `p-select`

Source des options :
- le composant appelle `ProfessionMockService.listProfessions()`
- chaque option contient `code` (valeur stockee) et `label` (texte affiche)

Utilisation :
- integre dans le formulaire parent via `formControlName="profession"`

## 9) Focus sur le CVA de genre
Le composant `GenderSelectControlComponent` implemente `ControlValueAccessor` pour encapsuler un select PrimeNG de genre.

Utilisation :
- integre dans le formulaire parent via `formControlName="gender"`

## 10) Focus sur le CVA de voiture
Le composant `CarSelectControlComponent` implemente `ControlValueAccessor` pour encapsuler un select PrimeNG de voiture.

Particularites :
- la valeur du controle est un objet `Car` (`brand`, `model`, `motorization`, `year`)
- l'affichage utilise `toString()` via la propriete `displayName`

Utilisation :
- integre dans le formulaire parent via `formControlName="car"`

## 11) Flux complet des donnees formulaire
1. L'utilisateur tape dans `UserFormComponent`.
2. Les controles Angular mettent a jour la valeur et la validite.
3. Pour `profession`, `ProfessionSelectControlComponent` propage la valeur code via `onChange`.
4. Pour `gender`, `GenderSelectControlComponent` propage la valeur code via `onChange`.
5. Pour `car`, `CarSelectControlComponent` propage l'instance `Car` via `onChange`.
6. Pour `address`, `AddressControlComponent` propage la valeur via `onChange`.
7. `submit()` construit un `User` (avec `profession`, `gender`, `car` et `Address`) et emet `create` ou `update`.
8. `UsersPageComponent` relaye vers `UsersFacade`.
9. `UsersFacade` met a jour les signals -> la liste se rafraichit.

Cas de duplication (mode edition) :
1. L'utilisateur clique sur `Dupliquer`.
2. Le formulaire est valide puis converti en `User`.
3. Le formulaire emet `create` (et non `update`) pour creer une nouvelle entree.
4. La facade assigne un nouvel identifiant et ajoute la copie a la liste.

## 12) Bonnes pratiques deja appliquees
- separation nette entre presentation (`components/`) et etat metier (`states/`)
- formulaire type et centralise
- changement dynamique des validateurs selon le mode creation/edition
- composant adresse reutilisable, encapsule et branchable par `formControlName`
- composant profession reutilisable, encapsule et alimente par un service dedie
- composant genre reutilisable pour normaliser une valeur API disponible (`male`/`female`)
- composant voiture reutilisable alimente par un service mock et base sur une classe metier

## 13) Limites actuelles et ameliorations recommandees
- `registerOnTouched` est prepare mais pas encore declenche sur `blur` des inputs adresse.
- validations adresse minimales : pas de validateurs specifiques (`required`, format code postal, etc.).
- pas de messages d'erreur dedies pour les champs d'adresse.

Pistes d'amelioration :
- ajouter des handlers `(blur)` dans `AddressControlComponent` pour appeler `onTouched()`
- ajouter des validateurs sur les champs adresse
- exposer les erreurs adresse dans le template parent pour un retour utilisateur plus explicite
- remplacer les donnees mockees des professions par une API reelle si besoin metier
- remplacer les donnees mockees des voitures par une API reelle si besoin metier

## 14) References rapides
- `src/app/components/user-form/user-form.component.ts`
- `src/app/components/user-form/user-form.component.html`
- `src/app/components/adress-control/address-control.component.ts`
- `src/app/components/profession-select-control/profession-select-control.component.ts`
- `src/app/core/services/profession-mock.service.ts`
- `src/app/components/gender-select-control/gender-select-control.component.ts`
- `src/app/components/car-select-control/car-select-control.component.ts`
- `src/app/core/services/car-mock.service.ts`
- `src/app/core/models/car.model.ts`
- `src/app/core/models/car-brand.model.ts`
- `src/app/views/users-pages/users-page.component.ts`
- `src/app/states/users.facade.ts`
