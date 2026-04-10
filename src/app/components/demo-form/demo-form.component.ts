import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { DividerModule } from 'primeng/divider';
import { FloatLabelModule } from 'primeng/floatlabel';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { City } from '../../core/models/demo/city.model';
import { ColorChoice } from '../../core/models/demo/color-choice.type';
import { FormChoicesComponent } from '../form-choices/form-choices.component';
import { SelectCitiesComponent } from '../select-cities/select-cities.component';

@Component({
	selector: 'app-demo-form',
	imports: [
		CommonModule,
		ReactiveFormsModule,
		ButtonModule,
		DatePickerModule,
		DividerModule,
		CheckboxModule,
		FloatLabelModule,
		IconFieldModule,
		InputIconModule,
		InputTextModule,
		ToastModule,
		SelectCitiesComponent,
		FormChoicesComponent,
	],
	templateUrl: './demo-form.component.html',
	styleUrl: './demo-form.component.scss',
	providers: [MessageService],
})
export class DemoFormComponent implements OnInit {
	private readonly fb = inject(FormBuilder);

	cities: City[] = [];
	submitted = 0;

	readonly colorChoiceForm = this.fb.group({
		color: this.fb.control<ColorChoice>(null, Validators.required),
	});

	readonly form = this.fb.group({
		textValue: this.fb.control<string | null>(null, {
			validators: [Validators.required, Validators.minLength(3), Validators.maxLength(20)],
		}),
		dateValue: this.fb.control<Date | null>(null, {
			validators: [Validators.required],
		}),
		selectedCities: this.fb.control<City[] | null>([], {
			validators: [Validators.required],
		}),
		checked: this.fb.nonNullable.control(false, {
			validators: [Validators.requiredTrue],
		}),
		colorChoice: this.colorChoiceForm,
	});

	constructor(private readonly messageService: MessageService) {}

	get f() {
		return this.form.controls;
	}

	ngOnInit(): void {
		this.loadData();
	}

	private loadData(): void {
		this.cities = [
			{ name: 'New York', code: 'NY' },
			{ name: 'Rome', code: 'RM' },
			{ name: 'London', code: 'LDN' },
			{ name: 'Istanbul', code: 'IST' },
			{ name: 'Paris', code: 'PRS' },
			{ name: 'Marseille', code: 'MAR' },
			{ name: 'Lille', code: 'LIL' },
			{ name: 'Tours', code: 'TOU' },
		];

		this.f.textValue.setValue('bonbon');
		this.colorChoiceForm.controls.color.setValue('blue');
	}

	showSuccess(): void {
		this.messageService.add({
			severity: 'success',
			summary: 'Succès',
			detail: 'PrimeNG est bien intégré !',
		});
	}

	showInfo(): void {
		this.messageService.add({
			severity: 'info',
			summary: 'Info',
			detail: "Ceci est un message d'information.",
		});
	}

	validateForm(): void {
		this.submitted++;
		if (this.form.invalid) {
			this.form.markAllAsTouched();
			return;
		}
		console.log('Form Value :', this.form.value);
	}

	toggleEnableDisable(): void {
		if (this.form.enabled) {
			this.form.disable();
			return;
		}
		this.form.enable();
	}
}

