# Qualité de code : Prettier + ESLint + VSCode

## Projet

- Angular 21 + TypeScript + PrimeNG 21

## Objectif

- le développeur n'ait pratiquement jamais à reformater son code à la main ;
- les erreurs de qualité soient détectées immédiatement (dans l'éditeur, avant le commit) ;
- le projet reste homogène quel que soit le développeur.

> 📚 **À retenir** : Prettier et ESLint ne font **pas** la même chose.
> - **Prettier** = forme (indentation, quotes, retours à la ligne...). Aucune règle n'est discutable, c'est binaire.
> - **ESLint** = fond (bonnes pratiques, bugs potentiels, code mort, "clean code"). Des règles avec une logique métier.
>
> Les faire cohabiter sans conflit demande un branchement explicite (voir plus bas), ce qui n'était
> pas le cas dans la version précédente de ce projet : les paquets étaient installés mais jamais reliés.

## Dépendances NPM

```bash
npm install -D \
  eslint \
  typescript-eslint \
  angular-eslint \
  eslint-plugin-import \
  eslint-plugin-unused-imports \
  eslint-plugin-sonarjs \
  eslint-plugin-unicorn \
  eslint-plugin-prettier \
  eslint-config-prettier \
  prettier \
  @stylistic/eslint-plugin
```

> ⚠️ **Correction** : `prettier` lui-même manquait de la liste/des devDependencies. Sans lui, `eslint-plugin-prettier`
> n'a rien à exécuter, et la commande `npm run format` n'existe pas.

## Scripts npm

```bash
npm run lint           # Analyse ESLint (lecture seule)
npm run lint:fix        # Analyse ESLint + corrections automatiques possibles
npm run format          # Reformate tous les fichiers avec Prettier
npm run format:check    # Vérifie le formatage sans rien modifier (utile en CI)
```

## Outils

| Outil | Rôle |
|---|---|
| **Prettier** | Formatage uniquement (indentation, quotes, espaces, retours à la ligne...). |
| **ESLint** | Bonnes pratiques, erreurs, "clean code". |
| **VSCode** | Applique automatiquement Prettier + ESLint à chaque sauvegarde. |

### Comment Prettier et ESLint coexistent dans `eslint.config.js`

1. `eslint-plugin-prettier` ajoute la règle `prettier/prettier` : une non-conformité Prettier devient une *erreur ESLint*,
   visible directement dans l'éditeur (extension Error Lens recommandée plus bas).
2. `eslint-config-prettier` **désactive** toutes les règles de style ESLint qui pourraient contredire Prettier
   (ex: indentation gérée par une règle ESLint *et* par Prettier en même temps). Cette config doit toujours être
   placée **en dernier** dans le tableau `defineConfig([...])`, sinon une config ajoutée après pourrait réactiver
   une règle qu'elle vient de désactiver.

### Plugins ESLint additionnels utilisés

- `eslint-plugin-import` → règle `import/order` : impose un tri/regroupement alphabétique des imports (lisibilité,
  évite les conflits Git inutiles sur les imports).
- `eslint-plugin-unused-imports` → détecte et supprime automatiquement (`--fix`) les imports et variables inutilisés,
  avec un message plus clair que la règle native TypeScript équivalente.
- `eslint-plugin-sonarjs` → détecte la complexité cognitive excessive, les duplications et autres "code smells"
  (mini-SonarQube directement dans ESLint).
- `eslint-plugin-unicorn` → bonnes pratiques JS/TS modernes (nommage, API natives préférées, pièges évités).
- `angular-eslint` → règles spécifiques Angular (TS et templates HTML).

## Pour aller plus loin (non installés dans ce projet pour l'instant)

Ces outils sont complémentaires mais demandent une installation et une configuration dédiées
(non présentes dans ce dépôt actuellement) :

- **SonarQube** : détecte la complexité cyclomatique, le code dupliqué, les "code smells", les risques de bugs et
  les problèmes de maintenabilité, à l'échelle de tout le projet (rapport centralisé, historique des métriques).
- **Husky** : exécute automatiquement des vérifications avant chaque commit (`pre-commit` hook Git).
- **lint-staged** : n'analyse que les fichiers modifiés/indexés (`git add`), ce qui accélère les contrôles avant commit.
- **Commitlint** : impose une convention de messages de commit (ex. [Conventional Commits](https://www.conventionalcommits.org/)).

Installation typique (à faire si vous voulez activer un contrôle pré-commit automatique) :

```bash
npm install -D husky lint-staged @commitlint/cli @commitlint/config-conventional
npx husky init
echo "npx lint-staged" > .husky/pre-commit
```

> 🎯 **But final visé** : la combinaison (Prettier + ESLint + SonarJS + Unicorn + Husky + lint-staged) vise une
> équivalence fonctionnelle avec ce que Checkstyle, PMD, SpotBugs et SonarQube apportent côté Java.

## Extensions VSCode recommandées

**Essentielles**
- Angular Language Service
- Prettier - Code formatter (`esbenp.prettier-vscode`)
- ESLint (`dbaeumer.vscode-eslint`)

**Confort**
- EditorConfig for VS Code
- GitLens
- Path Intellisense
- Error Lens (affiche les erreurs ESLint/TS directement en fin de ligne)
- Import Cost
- Todo Tree

## Fichiers de configuration

```bash
.editorconfig          # Indentation/encodage au niveau de l'éditeur, tous langages confondus
.gitignore
.prettierignore         # Fichiers/dossiers exclus du formatage Prettier
.prettierrc              # Règles de formatage Prettier
.vscode/settings.json    # Réglages d'éditeur appliqués à toute l'équipe (versionnés)
eslint.config.js         # Règles ESLint (format "flat config")
```

> ⚠️ **Correction** : le chemin était noté `./vscode/settings.json` (sans le point), ce qui n'est pas un dossier
> caché VSCode valide. Le bon chemin est `.vscode/settings.json`.

### Cohérence entre les fichiers

`.editorconfig` et `.prettierrc` doivent rester synchronisés sur l'indentation, sous peine de conflit silencieux
entre l'éditeur et le formatter :

| | `.editorconfig` | `.prettierrc` |
|---|---|---|
| Style | `indent_style = space` | `useTabs: false` |
| Taille | `indent_size = 4` | `tabWidth: 4` |
