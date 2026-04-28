import { ChangeDetectorRef, Component, inject, signal, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AutoComplete, AutoCompleteCompleteEvent, AutoCompleteSelectEvent, AutoCompleteUnselectEvent } from 'primeng/autocomplete';
import { Button } from 'primeng/button';
import { HelloWorldCar } from '../../core/models/demo/hello-world-car.model';
import { HelloWorldCarService } from '../../core/services/hello-world-car.service';

@Component({
  selector: 'app-autocomplete-button-sync-page',
  imports: [ReactiveFormsModule, AutoComplete, Button],
  templateUrl: './autocomplete-button-sync-page.component.html',
  styleUrl: './autocomplete-button-sync-page.component.scss',
})
export class AutocompleteButtonSyncPageComponent {
  private carService = inject(HelloWorldCarService);
  private cdr = inject(ChangeDetectorRef);

  @ViewChild('autoComplete') autoCompleteRef!: AutoComplete;

  /** FormControl réactif lié au p-autoComplete */
  carControl = new FormControl<HelloWorldCar[]>([], { nonNullable: true });

  /** Signal dérivé pour l'affichage de la liste en bas */
  selectedCars = signal<HelloWorldCar[]>([]);

  filteredCars = signal<HelloWorldCar[]>([]);

  carLabel = (car: HelloWorldCar): string => `${car.brand} - ${car.model} - ${car.year} - ${car.color}`;

  searchCars(event: AutoCompleteCompleteEvent): void {
    this.filteredCars.set(this.carService.search(event.query));
  }

  onSelect(_event: AutoCompleteSelectEvent): void {
    this.syncFromControl();
  }

  onUnselect(_event: AutoCompleteUnselectEvent): void {
    this.syncFromControl();
  }

  onClear(): void {
    this.selectedCars.set([]);
  }

  addRandomCar(): void {
    const allCars = this.carService.getAll();
    const currentIds = new Set(this.selectedCars().map(c => c.id));
    const available = allCars.filter(c => !currentIds.has(c.id));
    if (available.length === 0) return;

    const random = available[Math.floor(Math.random() * available.length)];
    // On force la création d'un nouveau tableau avec des références d'objets potentiellement nouvelles (deep clone simple)
    const updated = JSON.parse(JSON.stringify([...this.selectedCars(), random]));

    // Mise à jour de notre FormControl et Signal
    this.carControl.setValue(updated);
    this.selectedCars.set(updated);
    
    // Tentative de forcer la mise à jour interne du composant PrimeNG
    if (this.autoCompleteRef) {
      this.autoCompleteRef.writeValue(updated);
      this.autoCompleteRef.updateModel(updated);
      this.autoCompleteRef.cd.detectChanges();
    }
    
    this.cdr.detectChanges();
  }

  /** Synchronise le signal depuis la valeur actuelle du FormControl */
  private syncFromControl(): void {
    this.selectedCars.set(this.carControl.value ?? []);
  }
}

