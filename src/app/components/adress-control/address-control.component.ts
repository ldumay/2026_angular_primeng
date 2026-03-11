import { CommonModule } from '@angular/common';
import { Component, forwardRef } from '@angular/core';
import {
	ControlValueAccessor,
	FormControl,
	FormGroup,
	NG_VALUE_ACCESSOR,
	ReactiveFormsModule,
} from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Address } from '../../core/models/address.model';

/**
 * Composant d'adresse reutilisable en CVA pour integration native
 * dans les Reactive Forms.
 */
@Component({
	selector: 'app-address-control',
	imports: [CommonModule, ReactiveFormsModule, InputText],
	template: `
		<div [formGroup]="form" class="address-grid">
			<input pInputText formControlName="street" placeholder="Rue" />
			<input pInputText formControlName="city" placeholder="Ville" />
			<input pInputText formControlName="postalCode" placeholder="Code postal" />
			<input pInputText formControlName="country" placeholder="Pays" />
		</div>
	`,
	styleUrl: './address-control.component.scss',
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => AddressControlComponent),
			multi: true,
		},
	],
})
export class AddressControlComponent implements ControlValueAccessor {
	form = new FormGroup({
		street: new FormControl('', { nonNullable: true }),
		city: new FormControl('', { nonNullable: true }),
		postalCode: new FormControl('', { nonNullable: true }),
		country: new FormControl('', { nonNullable: true }),
	});

	private onChange: (value: Address) => void = () => {};
	private onTouched: () => void = () => {};

	constructor() {
		this.form.valueChanges.subscribe((value) => {
			this.onChange({
				street: value.street ?? '',
				city: value.city ?? '',
				postalCode: value.postalCode ?? '',
				country: value.country ?? '',
			});
		});
	}

	writeValue(value: Address | null): void {
		this.form.patchValue(value ?? { street: '', city: '', postalCode: '', country: '' }, {
			emitEvent: false,
		});
	}

	registerOnChange(fn: (value: Address) => void): void {
		this.onChange = fn;
	}

	registerOnTouched(fn: () => void): void {
		this.onTouched = fn;
	}

	setDisabledState(isDisabled: boolean): void {
		if (isDisabled) {
			this.form.disable({ emitEvent: false });
		} else {
			this.form.enable({ emitEvent: false });
		}
	}
}
