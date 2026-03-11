/** Domaine: marque de voiture. */
export class CarBrand {
	constructor(public name: string = '') {}

	toString(): string {
		return this.name;
	}
}
