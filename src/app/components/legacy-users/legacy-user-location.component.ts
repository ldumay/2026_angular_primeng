import { Component, inject } from '@angular/core';
import { ControlContainer, FormGroup, FormGroupDirective, ReactiveFormsModule } from '@angular/forms';

@Component({
	selector: 'app-legacy-user-location',
	imports: [ReactiveFormsModule],
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
	private readonly parentContainer = inject(ControlContainer);

	get locationGroup(): FormGroup {
		return (this.parentContainer.control as FormGroup).get('location') as FormGroup;
	}
}

