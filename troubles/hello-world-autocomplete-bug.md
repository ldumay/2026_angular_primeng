# Bug: Désynchronisation p-autoComplete (multiple) PrimeNG v21

## Description du problème
Dans la page Hello World, un composant `p-autoComplete` (avec `multiple="true"`) permet de sélectionner des voitures (chips). Il est également possible d'ajouter des voitures aléatoirement via un bouton.

Le scénario suivant met en évidence un bug de désynchronisation :
1. Ajout d'une voiture via le bouton "Aléatoire" (OK, le chip apparaît).
2. Ajout d'une voiture via le champ de recherche `p-autoComplete` (OK, 2 chips apparaissent).
3. Ajout d'une autre voiture via le bouton "Aléatoire".
   -> **Bug** : Le modèle (liste des voitures sélectionnées affichée en bas) est correct (3 voitures). Cependant, dans le champ de saisie `p-autoComplete`, les chips se désynchronisent : seulement 1 (ou parfois un nombre incorrect) chip est affiché.

## Hypothèses et recherches
- **Problème interne PrimeNG** : Il semble que le composant `p-autoComplete` de PrimeNG v21 ait un problème avec les mises à jour programmatiques successives (`setValue` ou `patchValue`) qui surviennent *après* une interaction manuelle avec le composant.
- Le composant conserve un état interne (`modelValue`) qui ne se met pas correctement à jour en fonction du modèle réactif s'il a été manipulé par l'utilisateur juste avant.
- Même en forçant la détection de changements avec `ChangeDetectorRef` ou en utilisant un `dataKey` ("id"), le problème de rendu visuel des chips persiste. Le modèle de données sous-jacent est correct, c'est purement un bug d'affichage/synchronisation interne de PrimeNG.

## Pistes de solution (workarounds)
Puisqu'il s'agit vraisemblablement d'un bug de la librairie PrimeNG elle-même pour cette version, les solutions "propres" (FormControl) ne suffisent pas. Nous devons forcer le composant à se redessiner ou contourner son état interne corrompu.

1. **Recréation du composant (ngIf hack)** : Détruire brièvement et recréer le composant `p-autoComplete` lors d'un ajout externe (via le bouton) pour forcer une réinitialisation complète de son état interne. C'est brutal mais souvent efficace contre les états internes corrompus.
2. **Accès via ViewChild** : Obtenir une référence directe au composant `AutoComplete` via `@ViewChild` et manipuler ses méthodes internes (ex: appeler `writeValue` manuellement, ou modifier `modelValue` et appeler `cd.detectChanges()` sur le composant lui-même).
3. **Clonage profond** : Bien que déjà testé partiellement (`[...this.selectedCars()]`), s'assurer que l'objet complet est recréé (deep clone, ex: avec `structuredClone`) pour tromper complètement la vérification d'égalité par référence de PrimeNG.

## Prochaine étape
Essayer la piste de l'accès direct via `@ViewChild` pour forcer la mise à jour interne de l'instance d'AutoComplete. Si cela échoue, nous tenterons la technique de recréation avec un flag de rendu (`ngIf`).
