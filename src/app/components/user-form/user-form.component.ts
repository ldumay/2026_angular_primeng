import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonDirective } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { User } from '../../core/models/user.model';
import { Address } from '../../core/models/address.model';
import { Car } from '../../core/models/car.model';
import { AddressControlComponent } from '../adress-control/address-control.component';
import { CarSelectControlComponent } from '../car-select-control/car-select-control.component';
import { GenderSelectControlComponent } from '../gender-select-control/gender-select-control.component';
import { ProfessionSelectControlComponent } from '../profession-select-control/profession-select-control.component';

/** Composant de formulaire reactif pour creation et edition d'utilisateur. */
@Component({
	selector: 'app-user-form',
	imports: [
		CommonModule,
		ReactiveFormsModule,
		InputText,
		PasswordModule,
		ButtonDirective,
		FloatLabelModule,
		AddressControlComponent,
		CarSelectControlComponent,
		GenderSelectControlComponent,
		ProfessionSelectControlComponent,
	],
	templateUrl: './user-form.component.html',
	styleUrl: './user-form.component.scss',
})
export class UserFormComponent implements OnChanges {
	@Input() selectedUser: User | null = null;

	@Output() create = new EventEmitter<User>();
	@Output() update = new EventEmitter<User>();
	@Output() remove = new EventEmitter<User>();
	@Output() resetSelection = new EventEmitter<void>();

	form = new FormGroup({
		firstName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
		lastName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
		email: new FormControl('', {
			nonNullable: true,
			validators: [Validators.required, Validators.email],
		}),
		password: new FormControl('', {
			nonNullable: true,
			validators: [Validators.required, Validators.minLength(8)],
		}),
		gender: new FormControl('', {
			nonNullable: true,
			validators: [Validators.required],
		}),
		profession: new FormControl('', {
			nonNullable: true,
			validators: [Validators.required],
		}),
		car: new FormControl<Car | null>(null, {
			validators: [Validators.required],
		}),
		address: new FormControl(
			{ street: '', city: '', postalCode: '', country: '' },
			{ nonNullable: true },
		),
	});

	get isEditMode(): boolean {
		return !!this.selectedUser;
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (!changes['selectedUser']) {
			return;
		}

		if (this.selectedUser) {
			this.form.patchValue({
				firstName: this.selectedUser.firstName,
				lastName: this.selectedUser.lastName,
				email: this.selectedUser.email,
				gender: this.selectedUser.gender,
				profession: this.selectedUser.profession,
				car: this.selectedUser.car,
				password: this.selectedUser.password ?? '',
				address: this.selectedUser.address,
			});
			this.form.controls.password.clearValidators();
			this.form.controls.password.setValidators([Validators.minLength(8)]);
			this.form.controls.password.updateValueAndValidity({ emitEvent: false });
		} else {
			this.form.reset({
				firstName: '',
				lastName: '',
				email: '',
				gender: '',
				profession: '',
				car: null,
				password: '',
				address: { street: '', city: '', postalCode: '', country: '' },
			});
			this.form.controls.password.setValidators([
				Validators.required,
				Validators.minLength(8),
			]);
			this.form.controls.password.updateValueAndValidity({ emitEvent: false });
		}
	}

	submit(): void {
		this.form.markAllAsTouched();
		if (this.form.invalid) {
			return;
		}

		const user = this.buildUserFromForm(this.selectedUser?.id ?? 0, this.selectedUser?.password);
		if (!user) {
			return;
		}

		if (this.selectedUser) {
			this.update.emit(user);
		} else {
			this.create.emit(user);
		}

		this.clear();
	}

	duplicateCurrent(): void {
		if (!this.selectedUser) {
			return;
		}

		this.form.markAllAsTouched();
		if (this.form.invalid) {
			return;
		}

		const duplicatedUser = this.buildUserFromForm(0, this.selectedUser.password);
		if (!duplicatedUser) {
			return;
		}

		this.create.emit(duplicatedUser);
		this.clear();
	}

	private buildUserFromForm(id: number, fallbackPassword?: string): User | null {
		const value = this.form.getRawValue();
		const trimmedPassword = value.password.trim();
		const resolvedPassword = trimmedPassword || fallbackPassword;

		if (!value.car) {
			return null;
		}

		const address = new Address(
			value.address.street,
			value.address.city,
			value.address.postalCode,
			value.address.country,
		);

		return new User(
			id,
			value.firstName,
			value.lastName,
			value.email,
			value.gender,
			value.profession,
			value.car,
			resolvedPassword,
			address,
		);
	}

	clear(): void {
		this.form.reset({
			firstName: '',
			lastName: '',
			email: '',
			gender: '',
			profession: '',
			car: null,
			password: '',
			address: { street: '', city: '', postalCode: '', country: '' },
		});
		this.resetSelection.emit();
	}

	deleteCurrent(): void {
		if (!this.selectedUser) {
			return;
		}

		this.remove.emit(this.selectedUser);
		this.clear();
	}
}
