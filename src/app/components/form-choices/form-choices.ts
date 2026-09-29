import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ColorChoice } from '../../core/models/demo/color-choice.type';

@Component({
	selector: 'app-form-choices',
	imports: [CommonModule, ReactiveFormsModule, RadioButtonModule],
	templateUrl: './form-choices.html',
	styleUrl: './form-choices.scss',
})
export class FormChoices {
	@Input({ required: true }) colorChoiceForm!: FormGroup;

	select(color: ColorChoice): void {
		this.colorChoiceForm.patchValue({ color });
		this.colorChoiceForm.markAsTouched();
	}

	get showRequiredError(): boolean {
		const control = this.colorChoiceForm.get('color');
		return !!control && control.touched && control.hasError('required');
	}
}

