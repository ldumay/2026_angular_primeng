/**
 * Enum des types de traction pour une locomotive.
 * Permet de typer strictement la propriété `type` et d'alimenter
 * les options de filtre / affichage sans chaînes magiques.
 */
export enum LocomotiveType {
	ELECTRIC = 'Électrique',
	DIESEL = 'Diesel',
	STEAM = 'Vapeur',
}

/**
 * Modèle domaine représentant une locomotive.
 * Indépendant de tout format API ou DTO.
 *
 * Propriétés :
 * - id           → identifiant unique (numérique)
 * - series       → série / classe (ex. « BB 7200 »)
 * - manufacturer → constructeur (ex. « Alstom »)
 * - year         → année de mise en service
 * - type         → type de traction (cf. LocomotiveType)
 * - country      → pays d'origine
 */
export class Locomotive {
	constructor(
		public id: number = 0,
		public series: string = '',
		public manufacturer: string = '',
		public year: number = new Date().getFullYear(),
		public type: LocomotiveType = LocomotiveType.ELECTRIC,
		public country: string = '',
	) {}

	/**
	 * Clé unique dérivée des propriétés métier.
	 * Utilisée comme `dataKey` dans les tables PrimeNG pour la détection de changement.
	 */
	get key(): string {
		return `${this.series}-${this.manufacturer}-${this.year}`.toLowerCase().replace(/\s+/g, '-');
	}

	/**
	 * Nom d'affichage complet de la locomotive.
	 * Format : « Série (Année) — Constructeur »
	 */
	get displayName(): string {
		return `${this.series} (${this.year}) — ${this.manufacturer}`;
	}

	toString(): string {
		return this.displayName;
	}
}
