import { Component, inject, signal, viewChild } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { AutoComplete, AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { Button } from 'primeng/button';
import { HelloWorldCar } from '../../core/models/demo/hello-world-car.model';
import { HelloWorldCarService } from '../../core/services/hello-world-car.service';

@Component({
  selector: 'app-hello-world-page',
  imports: [FormsModule, AutoComplete, Button],
  templateUrl: './hello-world-page.component.html',
  styleUrl: './hello-world-page.component.scss',
})
export class HelloWorldPageComponent {
  private carService = inject(HelloWorldCarService);
  private carSearchModel = viewChild<NgModel>('carSearchModel');

  selectedCars = signal<HelloWorldCar[]>([]);
  filteredCars = signal<HelloWorldCar[]>([]);

  carLabel = (car: HelloWorldCar): string => `${car.brand} - ${car.model} - ${car.year} - ${car.color}`;

  searchCars(event: AutoCompleteCompleteEvent): void {
    this.filteredCars.set(this.carService.search(event.query));
  }

  onSelectionChange(cars: HelloWorldCar[] | null): void {
    this.selectedCars.set(cars ?? []);
  }

  addRandomCar(): void {
    const allCars = this.carService.getAll();
    const currentIds = new Set(this.selectedCars().map(c => c.id));
    const available = allCars.filter(c => !currentIds.has(c.id));
    if (available.length === 0) return;
    const random = available[Math.floor(Math.random() * available.length)];
    const updated = [...this.selectedCars(), random];
    this.selectedCars.set(updated);
    this.carSearchModel()?.control.setValue(updated);
  }
}

