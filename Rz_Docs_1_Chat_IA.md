# Demande de base :

Depuis ce projet, créer un nouveau projet Angular 21 utilisant principalement la librairie PrimeNg 21.
Ce projet doit respecter une structure MVC, Class/DTO/Mapper, Services et ReactiveForms.
Ensuite, celui doit posséder :
- une page d'accueil avec :
    - le titre de l'application
    - un slogan de motivation
    - une description de l'application
    - une liste de lien vers les autres pages de l'application
- une page de gestion des utilisateurs avec :
    - à gauche - une liste des utilisateurs existants
        - feature de cette liste :
            - cette liste affiche des utilisateurs via le service de gestion des utilisateurs, qui utilise une API REST de démo gratuite pour récupérer les données des utilisateurs
            - chaque utilisateur doit être affiché avec son nom, prénom et email
            - chaque utilisateur doit avoir des boutons pour modifier et supprimer l'utilisateur
            - la liste des utilisateurs doit être réactive et se mettre à jour automatiquement lors de la création, modification ou suppression d'un utilisateur
            - la liste des utilisateurs doit être paginée et triable par nom, prénom et email
            - la liste des utilisateurs doit permettre de rechercher des utilisateurs par nom, prénom et email
    - à droite - un formulaire de création d'utilisateur avec les champs suivants :
        - User (nom, prénom, email, mot de passe, adresse)
        - Adresse (rue, ville, code postal, pays)
        - feature de ce formulaire :
            - cette page doit permettre de créer, modifier et supprimer des utilisateurs
            - les champs User naturellement, mais aussi les champs d'adresse via un composant d'adresse réutilisable, respectant ReactiveForms et CVA.
            - il doit être réactif et permettre de pré-remplir les champs lors de la modification d'un utilisateur, ainsi que de réinitialiser les champs après la création ou la modification d'un utilisateur, de même que de supprimer les champs du formulaire lors de la suppression d'un utilisateur
            - les champs du formulaire doivent être validés et afficher des messages d'erreur appropriés en cas de validation échouée
Chaque page est un composant Angular dédié et réutilisable, ainsi que les services nécessaires pour gérer les données et la logique métier. 
Utiliser des DTOs pour structurer les données et des mappers pour convertir entre les entités et les DTOs. 
Assurer une séparation claire entre la logique de présentation, la logique métier et la gestion des données conformément à l'architecture MVC.
Ajoute une documentation claire et concise pour chaque composant, service, DTO et mapper, expliquant leur rôle et leur fonctionnement dans l'application.

---

# Analyse de la demande

## Objectif global
Construire une application Angular 21 avec PrimeNG 21, orientee gestion des utilisateurs, en respectant une architecture propre:
- MVC (presentation / logique metier / donnees)
- Class + DTO + Mapper
- Services
- Reactive Forms + composant CVA reutilisable pour l'adresse

## Exigences fonctionnelles

### 1. Page d'accueil
- titre de l'application
- slogan motivationnel
- description
- liste de liens vers les autres pages

### 2. Page de gestion des utilisateurs

#### Colonne gauche: liste utilisateurs
- Donnees recuperees via un service connecte a une API REST de demo gratuite
- Affichage: nom, prenom, email
- Actions par utilisateur: modifier, supprimer
- Liste reactive (mise a jour automatique apres create/update/delete)
- Pagination
- Tri par nom, prenom, email
- Recherche par nom, prenom, email

#### Colonne droite: formulaire utilisateur
- Champs utilisateur: nom, prenom, email, mot de passe, adresse
- Champs adresse: rue, ville, code postal, pays
- Adresse geree via un composant reutilisable ControlValueAccessor (CVA)
- Support create/update/delete
- Pre-remplissage en mode edition
- Reinitialisation apres creation/modification
- Nettoyage apres suppression
- Validation complete des champs + messages d'erreur

## Exigences techniques et structure
- Chaque page est un composant dedie et reutilisable
- Services separes pour logique metier et acces donnees
- DTOs pour structurer les echanges
- Mappers pour convertir entre objets domaine et DTOs
- Separation claire des responsabilites selon MVC
- Documentation concise de chaque composant/service/DTO/mapper

## Points d'attention
- Les API REST de demo ne garantissent pas toujours une persistence CRUD reelle.
    Solution recommandee: chargement initial depuis API + store local reactif (BehaviorSubject ou Signal) pour refleter create/update/delete dans l'interface.
- Le composant CVA d'adresse doit propager correctement touched/dirty/disabled et les erreurs de validation.
- Le comportement du mot de passe en edition doit etre defini (obligatoire seulement en creation, ou aussi en modification).

## Proposition de decomposition initiale
- `core/`: modeles domaine, DTOs, mappers, services API
- `features/home/`: composant page d'accueil
- `features/users/`:
    - `users-page`: orchestration de la page
    - `users-list`: table PrimeNG (tri, pagination, recherche)
    - `user-form`: formulaire Reactive Forms
    - `address-control`: composant CVA reutilisable
    - `users-facade`: service reactif d'etat applicatif
- `shared/`: composants/utilitaires communs

## Priorites de mise en oeuvre
1. Initialiser le projet Angular 21 + PrimeNG 21.
2. Mettre en place l'architecture (routing, dossiers, couches core/features/shared).
3. Implementer la gestion utilisateurs avec service API + facade reactive + DTO/mapper.
4. Ajouter formulaire Reactive Forms avec composant adresse CVA et validations.
5. Documenter chaque composant, service, DTO et mapper.

---

Plusieurs itérations ont succédées pour arriver à cette proposition de test.