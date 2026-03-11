import { CarBrand } from './car-brand.model';

/** Domaine: voiture selectionnable pour un utilisateur. */
export class Car {
	constructor(
		public brand: CarBrand = new CarBrand(),
		public model: string = '',
		public motorization: string = '',
		public year: number = new Date().getFullYear()
	) {}

	get key(): string {
		return `${this.brand.name}-${this.model}-${this.motorization}-${this.year}`.toLowerCase();
	}

	get displayName(): string {
		return this.toString();
	}

	toString(): string {
		return `${this.brand.toString()} ${this.model} ${this.motorization} (${this.year})`;
	}
}
