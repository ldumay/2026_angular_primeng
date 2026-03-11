import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Car } from '../models/car.model';
import { CarBrand } from '../models/car-brand.model';

/** Service dedie aux donnees mockees de voitures. */
@Injectable({ providedIn: 'root' })
export class CarMockService {
	private readonly cars: Car[] = [
		new Car(new CarBrand('Peugeot'), '308', 'Essence', 2021),
		new Car(new CarBrand('Renault'), 'Clio', 'Hybride', 2022),
		new Car(new CarBrand('Tesla'), 'Model 3', 'Electrique', 2023),
		new Car(new CarBrand('Volkswagen'), 'Golf', 'Diesel', 2020),
		new Car(new CarBrand('Toyota'), 'Corolla', 'Hybride', 2024),
	];

	listCars(): Observable<Car[]> {
		return of([...this.cars]);
	}
}
