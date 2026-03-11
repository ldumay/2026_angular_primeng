import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonDirective } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { User } from '../../core/models/user.model';
import { Address } from '../../core/models/address.model';
import { AddressControlComponent } from '../adress-control/address-control.component';
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
		AddressControlComponent,
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
		profession: new FormControl('', {
			nonNullable: true,
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
				profession: this.selectedUser.profession,
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
				profession: '',
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

		const value = this.form.getRawValue();
		const trimmedPassword = value.password.trim();
		const resolvedPassword = this.selectedUser
			? trimmedPassword || this.selectedUser.password
			: trimmedPassword;
		const address = new Address(
			value.address.street,
			value.address.city,
			value.address.postalCode,
			value.address.country,
		);

		const user = new User(
			this.selectedUser?.id ?? 0,
			value.firstName,
			value.lastName,
			value.email,
			value.profession,
			resolvedPassword,
			address,
		);

		if (this.selectedUser) {
			this.update.emit(user);
		} else {
			this.create.emit(user);
		}

		this.clear();
	}

	clear(): void {
		this.form.reset({
			firstName: '',
			lastName: '',
			email: '',
			profession: '',
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
