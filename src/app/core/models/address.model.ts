/** Domaine: adresse utilisateur manipulee dans l'application. */
export class Address {
	constructor(
		public street: string = '',
		public city: string = '',
		public postalCode: string = '',
		public country: string = ''
	) {}
}
