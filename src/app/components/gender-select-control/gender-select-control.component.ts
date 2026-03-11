import { CommonModule } from '@angular/common';
import { Component, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SelectChangeEvent, SelectModule } from 'primeng/select';

interface GenderOption {
	code: string;
	label: string;
}

/** Selecteur de genre reutilisable en CVA pour Reactive Forms. */
@Component({
	selector: 'app-gender-select-control',
	imports: [CommonModule, FormsModule, SelectModule],
	templateUrl: './gender-select-control.component.html',
	styleUrl: './gender-select-control.component.scss',
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => GenderSelectControlComponent),
			multi: true,
		},
	],
})
export class GenderSelectControlComponent implements ControlValueAccessor {
	readonly options: GenderOption[] = [
		{ code: 'male', label: 'Homme' },
		{ code: 'female', label: 'Femme' },
	];

	value = '';
	disabled = false;

	private onChange: (value: string) => void = () => {};
	private onTouched: () => void = () => {};

	writeValue(value: string | null): void {
		this.value = value ?? '';
	}

	registerOnChange(fn: (value: string) => void): void {
		this.onChange = fn;
	}

	registerOnTouched(fn: () => void): void {
		this.onTouched = fn;
	}

	setDisabledState(isDisabled: boolean): void {
		this.disabled = isDisabled;
	}

	onSelectionChange(event: SelectChangeEvent): void {
		this.value = String(event.value ?? '');
		this.onChange(this.value);
	}

	handleBlur(): void {
		this.onTouched();
	}
}
