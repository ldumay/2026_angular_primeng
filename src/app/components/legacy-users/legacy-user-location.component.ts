import { Component, inject } from '@angular/core';
import { ControlContainer, FormGroup, FormGroupDirective, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';

@Component({
	selector: 'app-legacy-user-location',
	imports: [ReactiveFormsModule, InputTextModule, SelectModule],
	viewProviders: [
		{
			provide: ControlContainer,
			useExisting: FormGroupDirective,
		},
	],
	templateUrl: './legacy-user-location.component.html',
	styleUrl: './legacy-user-location.component.scss',
})
export class LegacyUserLocationComponent {
	readonly countryOptions = [
		{ label: 'France', value: 'FR' },
		{ label: 'Belgique', value: 'BE' },
		{ label: 'Suisse', value: 'CH' },
		{ label: 'Canada', value: 'CA' },
	];

	private readonly parentContainer = inject(ControlContainer);

	get locationGroup(): FormGroup {
		return (this.parentContainer.control as FormGroup).get('location') as FormGroup;
	}
}

