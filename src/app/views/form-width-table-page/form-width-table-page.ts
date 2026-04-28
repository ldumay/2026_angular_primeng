import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { City } from '../../core/models/demo/city.model';
import { SelectCitiesComponent } from '../../components/select-cities/select-cities.component';

@Component({
  selector: 'app-form-width-table-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SelectCitiesComponent],
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
      citySelector: [null, Validators.required],
      tableCities: [this.tableCities],
    });
  }

  addCity() {
    const selected: City = this.form.value.citySelector;
    if (selected && !this.tableCities.find(c => c.code === selected.code)) {
      this.tableCities = [...this.tableCities, selected];
      this.form.patchValue({ tableCities: this.tableCities });
    }
  }

  removeCity(city: City) {
    this.tableCities = this.tableCities.filter(c => c.code !== city.code);
    this.form.patchValue({ tableCities: this.tableCities });
  }
}
