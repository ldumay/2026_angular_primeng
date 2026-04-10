import { CommonModule } from '@angular/common';
import { Component, Input, forwardRef } from '@angular/core';
import {
	AbstractControl,
	ControlValueAccessor,
	FormsModule,
	NG_VALIDATORS,
	NG_VALUE_ACCESSOR,
	ValidationErrors,
	Validator,
} from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { MultiSelectModule } from 'primeng/multiselect';
import { City } from '../../core/models/demo/city.model';

@Component({
	selector: 'app-select-cities',
	imports: [CommonModule, FormsModule, FloatLabelModule, MultiSelectModule],
	templateUrl: './select-cities.component.html',
	styleUrl: './select-cities.component.scss',
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => SelectCitiesComponent),
			multi: true,
		},
		{
			provide: NG_VALIDATORS,
			useExisting: forwardRef(() => SelectCitiesComponent),
			multi: true,
		},
	],
})
export class SelectCitiesComponent implements ControlValueAccessor, Validator {
	@Input() cities: City[] = [];

	selectedCities: City[] = [];
	isDisabled = false;

	private onChange: (val: City[]) => void = () => undefined;
	private onTouched: () => void = () => undefined;

	writeValue(value: City[] | null): void {
		this.selectedCities = value ?? [];
	}

	registerOnChange(fn: (val: City[]) => void): void {
		this.onChange = fn;
	}

	registerOnTouched(fn: () => void): void {
		this.onTouched = fn;
	}

	setDisabledState(isDisabled: boolean): void {
		this.isDisabled = isDisabled;
	}

	onInternalChange(event: { value: City[] }): void {
		this.selectedCities = event.value;
		this.onChange(this.selectedCities);
		this.onTouched();
	}

	handleBlur(): void {
		this.onTouched();
	}

	validate(_: AbstractControl): ValidationErrors | null {
		return this.selectedCities.length > 0 ? null : { required: true };
	}
}

