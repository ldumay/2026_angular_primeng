import { Address } from './address.model';
import { Car } from './car.model';

/** Domaine: utilisateur manipule par les composants et services metier. */
export class User {
	constructor(
		public id: number = 0,
		public firstName: string = '',
		public lastName: string = '',
		public email: string = '',
		public gender: string = '',
		public profession: string = '',
		public car: Car | null = null,
		public password?: string,
		public address: Address = new Address()
	) {}
}
