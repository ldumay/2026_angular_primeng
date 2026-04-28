import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { City } from '../../core/models/demo/city.model';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { Select } from 'primeng/select';
import { FloatLabel } from 'primeng/floatlabel';

@Component({
  selector: 'app-form-width-table-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    Select,
    FloatLabel,
  ],
  templateUrl: './form-width-table-page.html',
  styleUrl: './form-width-table-page.scss',
})
export class FormWidthTablePage {
  form: FormGroup;

  cities: City[] = [
    { name: 'New York', code: 'NY' },
    { name: 'Rome', code: 'RM' },
    { name: 'London', code: 'LDN' },
    { name: 'Istanbul', code: 'IST' },
    { name: 'Paris', code: 'PRS' },
    { name: 'Marseille', code: 'MAR' },
    { name: 'Lille', code: 'LIL' },
    { name: 'Tours', code: 'TOU' },
  ];

  tableCities: City[] = [
    { name: 'Paris', code: 'PRS' },
    { name: 'London', code: 'LDN' },
    { name: 'Rome', code: 'RM' },
  ];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      citySelector: [null],
      tableCities: [this.tableCities],
    });
  }

  /** Villes disponibles = toutes les villes sauf celles déjà dans la table */
  get availableCities(): City[] {
    return this.cities.filter(
      (c) => !this.tableCities.find((tc) => tc.code === c.code),
    );
  }

  addCity() {
    const selected: City = this.form.value.citySelector;
    if (selected && !this.tableCities.find((c) => c.code === selected.code)) {
      this.tableCities = [...this.tableCities, selected];
      this.form.patchValue({ citySelector: null, tableCities: this.tableCities });
    }
  }

  removeCity(city: City) {
    this.tableCities = this.tableCities.filter((c) => c.code !== city.code);
    this.form.patchValue({ tableCities: this.tableCities });
  }
}
