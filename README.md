# [2026] Angular 21 with PrimeNG & PrimeFlex 21

Ceci est un projet de tests Angular 21 utilisant PrimeNG et PrimeFlex 21.

## Idée principale

L'idée principale du projet de test est sourcée dans le fichier `Rz_Docs_1_Chat_IA.md`.

## Documentation

Une documentation technique detaillee du projet est disponible ici :

- architecture globale : `docs/architecture-et-mecaniques.md`
- reactive forms et cva (adresse + profession + genre + voiture) : `docs/reactive-forms-et-cva.md`
- troubleshooting (problemes rencontres et correctifs) : `docs/troubleshooting.md`

## API REST :

- données utilisateurs de démo gratuite : https://randomuser.me/api/?results=<nombre_utilisateurs>

Autres non utilisées pour le moment

- https://free-apis.github.io/

## Docker

L'application peut être compilée et servie par Nginx :

```sh
docker build -t angular-primeng-app .
docker run --rm -p 8080:80 angular-primeng-app
```

Elle est alors disponible sur `http://localhost:8080/`. La configuration Nginx conserve le routage Angular pour les accès directs aux pages, y compris `/logs`.

--

### Bonus - VSCode tools:

- [Container Tools](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-containers)
