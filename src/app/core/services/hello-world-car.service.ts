import { Injectable } from '@angular/core';
import { HelloWorldCar } from '../models/demo/hello-world-car.model';
import { HELLO_WORLD_CARS_MOCK } from '../mocks/hello-world-cars.mock';

@Injectable({ providedIn: 'root' })
export class HelloWorldCarService {

  search(query: string): HelloWorldCar[] {
    const lower = query.toLowerCase();
    return HELLO_WORLD_CARS_MOCK.filter(car =>
      car.brand.toLowerCase().includes(lower) ||
      car.model.toLowerCase().includes(lower) ||
      car.color.toLowerCase().includes(lower) ||
      car.year.toString().includes(lower)
    );
  }

  getAll(): HelloWorldCar[] {
    return [...HELLO_WORLD_CARS_MOCK];
  }
}

