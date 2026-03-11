# Documentation technique - Architecture et mecaniques du projet

## 1) Objectif de cette documentation
Ce document decrit de maniere simple et detaillee les outils, couches techniques et flux de donnees utilises dans le projet Angular 21 + PrimeNG 21.

Il couvre :
- la structure des pages
- les modeles metier
- les DTO et le mapper
- les services et la facade d'etat
- les composants UI (liste, formulaire, CVA adresse)
- la mecanique reactive entre toutes les parties

## 2) Stack et outils utilises
- Framework : Angular 21 (standalone components)
- UI : PrimeNG 21
- Theme PrimeNG : Aura (`@primeuix/themes`)
- Utilitaires CSS : PrimeFlex 4 + PrimeIcons 7
- HTTP : `HttpClient`
- Reactivite locale : Angular Signals (`signal`, `computed`)
- Formulaires : Reactive Forms + ControlValueAccessor (CVA)
- Donnees de demonstration : API `https://randomuser.me/api`

Fichiers de reference :
- `package.json`
- `src/main.ts`
- `src/app/app.config.ts`
- `src/styles.scss`

## 3) Vue d'ensemble de l'architecture
Le projet suit une separation claire des responsabilites :

- Presentation (Vue) : pages + composants PrimeNG
- Logique metier (Controller/Facade) : `UsersFacade`
- Donnees (Model + Service + DTO/Mapper) : models, service HTTP, DTO API et mapper

Structure principale :
- `src/app/views/` : pages de l'application (`home`, `users-pages`)
- `src/app/components/` : composants reutilisables (`users-list`, `user-form`, `adress-control`)
- `src/app/core/models/` : modeles domaine (`User`, `Address`)
- `src/app/core/dto/` : contrats des reponses API
- `src/app/core/mappers/` : conversion DTO -> modele domaine
- `src/app/core/services/` : acces HTTP
- `src/app/states/` : facade d'etat applicatif

## 4) Navigation et pages
### 4.1 Routing
Le routing est defini dans `src/app/app.routes.ts` :
- `/` -> `HomePageComponent`
- `/users` -> `UsersPageComponent`
- `**` -> redirection vers `/`

### 4.2 Shell applicatif
`src/app/app.ts` + `src/app/app.html` :
- toolbar PrimeNG globale
- boutons de navigation vers Accueil / Utilisateurs
- zone de rendu via `<router-outlet />`

### 4.3 Page d'accueil
`src/app/views/home/home-page.component.ts` + `.html` :
- titre applicatif
- slogan motivationnel
- description du projet
- lien d'acces a la page utilisateurs

### 4.4 Page utilisateurs
`src/app/views/users-pages/users-page.component.ts` :
- orchestration de 2 blocs :
  - gauche : liste utilisateurs (`app-users-list`)
  - droite : formulaire creation/edition (`app-user-form`)
- branche les evenements UI sur la facade (`load`, `select`, `create`, `update`, `remove`, `clearAll`)

## 5) Couche donnees : Modeles, DTO, Mapper, Service
### 5.1 Modeles domaine
- `src/app/core/models/user.model.ts`
- `src/app/core/models/address.model.ts`

Ces classes representent les objets manipules dans l'application (independants du format API).

### 5.2 DTO API
`src/app/core/dto/user-api.dto.ts` decrit le format de `randomuser.me` :
- `UserApiDto`
- sous-DTO (`name`, `location`, `login`, etc.)
- `UserApiListResponseDto` pour la reponse liste

### 5.3 Mapper
`src/app/core/mappers/user.mapper.ts` convertit `UserApiDto` vers `User` :
- adaptation des noms de champs
- transformation de la rue (`number + name`)
- conversion de l'identifiant UUID en entier (`uuidToNumericId`) pour simplifier la gestion locale

### 5.4 Service HTTP
`src/app/core/services/user-api.service.ts` :
- centralise l'appel HTTP `GET https://randomuser.me/api/?results=20&nat=fr`
- applique le mapper pour retourner `Observable<User[]>`
- isole la couche presentation de la logique d'acces API

## 6) Couche metier : facade reactive
`src/app/states/users.facade.ts` est la couche pivot.

Responsabilites :
- stocker l'etat utilisateurs en signal (`usersState`)
- stocker l'utilisateur selectionne (`selectedUserIdState`)
- exposer des valeurs derivees (`users`, `selectedUser`)
- gerer les operations CRUD cote client

Mecaniques :
- `load()` : charge les utilisateurs via le service API
- `select(user)` : memorise la selection pour edition
- `create(user)` : ajoute localement un utilisateur avec id local incremental
- `update(user)` : remplace l'utilisateur correspondant dans le store
- `remove(id)` : supprime et annule la selection si besoin
- `clearAll()` : vide liste + selection

Important :
- le CRUD est local apres chargement initial (pas de POST/PUT/DELETE serveur)
- ce choix est coherent avec une API de demo qui n'offre pas une persistance metier complete

## 7) Composants et mecaniques UI
### 7.1 Liste utilisateurs
Fichiers :
- `src/app/components/users-list/users-list.component.ts`
- `src/app/components/users-list/users-list.component.html`

Role : composant de presentation de la table.

Fonctionnalites :
- affichage via `p-table`
- pagination (`rows`, `rowsPerPageOptions`)
- tri multi-colonnes (`sortMode="multiple"`)
- recherche globale (`filterGlobal`)
- actions par ligne : modifier / supprimer
- action globale : vider la liste

Communication :
- entrees (`@Input`) : `users`
- sorties (`@Output`) : `edit`, `remove`, `clearAll`

### 7.2 Formulaire utilisateur (Reactive Forms)
Fichiers :
- `src/app/components/user-form/user-form.component.ts`
- `src/app/components/user-form/user-form.component.html`

Role : creation/edition/suppression utilisateur.

Mecaniques principales :
- `FormGroup` type avec controles : `firstName`, `lastName`, `email`, `password`, `address`
- validations : `required`, `email`, `minLength(8)`
- mode creation vs edition pilote par `selectedUser`
- `ngOnChanges` pre-remplit le formulaire en edition
- mot de passe :
  - obligatoire en creation
  - optionnel en edition (conserve l'ancien si vide)
- `submit()` emet `create` ou `update`
- `clear()` reinitialise formulaire + deselection
- `deleteCurrent()` emet suppression puis nettoyage

### 7.3 Composant adresse reutilisable (CVA)
Fichier :
- `src/app/components/adress-control/address-control.component.ts`

Role : encapsuler les champs d'adresse comme controle reutilisable compatible Reactive Forms.

Mecaniques CVA :
- `writeValue` : injecte une valeur externe dans le composant
- `registerOnChange` : propage les changements vers le parent
- `registerOnTouched` : prepare la propagation de l'etat touched
- `setDisabledState` : synchronise l'etat active/desactive

Utilisation :
- integre dans `UserFormComponent` via `formControlName="address"`

## 8) Flux de donnees bout-en-bout
### 8.1 Chargement initial
1. `UsersPageComponent.ngOnInit()` appelle `facade.load()`.
2. `UsersFacade.load()` appelle `UserApiService.listUsers()`.
3. Le service interroge l'API et mappe les DTO en `User`.
4. La facade alimente `usersState`.
5. La liste (`app-users-list`) se met a jour automatiquement via signal.

### 8.2 Edition
1. Clic "modifier" dans la table -> `edit.emit(user)`.
2. `UsersPageComponent.onEdit()` appelle `facade.select(user)`.
3. `selectedUser` change -> `UserFormComponent.ngOnChanges()` patch le formulaire.
4. Soumission -> `update.emit(user)` -> `facade.update(user)`.
5. La table est reactive et affiche la nouvelle valeur.

### 8.3 Creation
1. Formulaire vide + validation OK.
2. `create.emit(user)` -> `facade.create(user)`.
3. Ajout local en tete de liste avec id calcule localement.
4. Reset formulaire + clear selection.

### 8.4 Suppression
1. Suppression depuis la table ou le formulaire.
2. `facade.remove(id)` retire l'entree du store.
3. Si l'utilisateur supprime etait selectionne, la selection est annulee.
4. Le formulaire est nettoye.

## 9) Correspondance avec la demande initiale
### 9.1 Points bien couverts
- Angular 21 + PrimeNG 21
- architecture separee pages / composants / core / state
- modeles + DTO + mapper
- service de recuperation des utilisateurs via API REST de demo
- formulaire reactif avec composant adresse reutilisable en CVA
- create/update/delete local reactif
- page d'accueil avec titre, slogan, description, lien

### 9.2 Ecarts a corriger pour coller 100% au cahier des charges
- La liste n'affiche actuellement pas l'email (seulement nom/prenom).
- La recherche globale cible actuellement `firstName` et `lastName`, pas `email`.
- Le tri est configure pour nom/prenom, pas `email`.
- Les validations d'adresse sont minimales (pas de messages d'erreur dedies).
- `registerOnTouched` est defini dans le CVA, mais aucun evenement de blur ne declenche `onTouched`.

## 10) Guide rapide d'extension
Pour evoluer sans casser l'architecture :
- garder les transformations de donnees dans `mappers/`
- garder l'acces API brut dans `services/`
- centraliser l'etat de page et les regles metier dans `states/users.facade.ts`
- garder les composants `views/` orientee orchestration
- garder les composants `components/` orientee presentation/reutilisation

## 11) Fichiers a consulter en priorite
- `src/app/views/users-pages/users-page.component.ts`
- `src/app/states/users.facade.ts`
- `src/app/core/services/user-api.service.ts`
- `src/app/core/mappers/user.mapper.ts`
- `src/app/components/user-form/user-form.component.ts`
- `src/app/components/adress-control/address-control.component.ts`
- `src/app/components/users-list/users-list.component.html`
