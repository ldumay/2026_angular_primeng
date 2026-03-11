# Troubleshooting - Problemes rencontres et correctifs

Ce document centralise les problemes techniques rencontres dans le projet et les solutions appliquees.

## 1) FloatLabel bug avec des selects CVA personnalises
### Symptome
Les labels en `variant="on"` ne flottent pas correctement (position qui se superpose, label qui ne monte pas, etat visuel incoherent) quand le `p-floatlabel` est place dans le composant parent autour d'un composant CVA personnalise.

### Cause
`p-floatlabel` fonctionne de maniere fiable quand il encapsule directement un controle PrimeNG cible (`p-select`, `p-inputtext`, etc.) avec un `inputId` coherent et un `label for="..."` associe.

Quand le controle est encapsule dans un composant CVA (ex: `<app-profession-select-control>`), le parent ne contient plus directement le `p-select`, et le composant `FloatLabel` ne peut pas toujours detecter correctement les etats internes (focus/filled).

### Correctif applique
Le `p-floatlabel` est deplace a l'interieur de chaque composant CVA de select :
- `src/app/components/profession-select-control/profession-select-control.component.html`
- `src/app/components/gender-select-control/gender-select-control.component.html`
- `src/app/components/car-select-control/car-select-control.component.html`

Chaque composant expose :
- `@Input() label`
- `@Input() inputId`

Et le `p-select` interne est relie au label :
- `[inputId]="inputId"`
- `<label [for]="inputId">{{ label }}</label>`

### Pattern recommande
Pour tout nouveau controle CVA qui encapsule un champ PrimeNG :
1. Gerer le `p-floatlabel` dans le composant CVA, pas dans le parent.
2. Exposer `label` et `inputId` en inputs.
3. Lier explicitement `inputId` et `label for`.
4. Garder `registerOnTouched` branche sur `blur`.

## 2) Warning Angular Language Service "component not used within template"
### Symptome
Le service de langage peut parfois signaler a tort qu'un composant standalone importe n'est pas utilise, alors qu'il est bien present dans le template externe.

### Cause probable
Etat stale de l'indexation du service de langage, notamment apres grosses modifications de templates/composants.

### Actions conseillees
- relancer le serveur TypeScript dans VS Code
- sauvegarder tous les fichiers
- relancer `ng serve`

Si le build compile et le composant est rendu, il s'agit generalement d'un faux positif.
