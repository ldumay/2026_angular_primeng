import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, forwardRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SelectChangeEvent, SelectModule } from 'primeng/select';
import { ProfessionMockService } from '../../core/services/profession-mock.service';

/**
 * Selecteur de profession reutilisable en CVA pour integration native
 * dans les Reactive Forms.
 */
@Component({
	selector: 'app-profession-select-control',
	imports: [CommonModule, AsyncPipe, FormsModule, SelectModule],
	templateUrl: './profession-select-control.component.html',
	styleUrl: './profession-select-control.component.scss',
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => ProfessionSelectControlComponent),
			multi: true,
		},
	],
})
export class ProfessionSelectControlComponent implements ControlValueAccessor {
	private readonly professionService = inject(ProfessionMockService);

	readonly professions$ = this.professionService.listProfessions();

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
