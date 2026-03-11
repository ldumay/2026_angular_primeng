import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, forwardRef, inject, Input } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { SelectChangeEvent, SelectModule } from 'primeng/select';
import { Car } from '../../core/models/car.model';
import { CarMockService } from '../../core/services/car-mock.service';

/** Selecteur de voiture reutilisable en CVA pour Reactive Forms. */
@Component({
	selector: 'app-car-select-control',
	imports: [CommonModule, AsyncPipe, FormsModule, SelectModule, FloatLabelModule],
	templateUrl: './car-select-control.component.html',
	styleUrl: './car-select-control.component.scss',
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => CarSelectControlComponent),
			multi: true,
		},
	],
})
export class CarSelectControlComponent implements ControlValueAccessor {
	@Input() label = 'Voiture';
	@Input() inputId = 'car';

	private readonly carService = inject(CarMockService);

	readonly cars$ = this.carService.listCars();

	value: Car | null = null;
	disabled = false;

	private onChange: (value: Car | null) => void = () => {};
	private onTouched: () => void = () => {};

	writeValue(value: Car | null): void {
		this.value = value;
	}

	registerOnChange(fn: (value: Car | null) => void): void {
		this.onChange = fn;
	}

	registerOnTouched(fn: () => void): void {
		this.onTouched = fn;
	}

	setDisabledState(isDisabled: boolean): void {
		this.disabled = isDisabled;
	}

	onSelectionChange(event: SelectChangeEvent): void {
		this.value = (event.value as Car | null) ?? null;
		this.onChange(this.value);
	}

	handleBlur(): void {
		this.onTouched();
	}
}
