import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonDirective } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { LegacyUser } from '../../core/models/legacy-user.model';
import { LegacyUserLocation } from './legacy-user-location';

@Component({
	selector: 'app-legacy-user-form',
	imports: [
		CommonModule,
		ReactiveFormsModule,
		InputTextModule,
		ButtonDirective,
		LegacyUserLocation,
	],
	templateUrl: './legacy-user-form.html',
	styleUrl: './legacy-user-form.scss',
})
export class LegacyUserForm implements OnChanges {
	@Input() selectedUser: LegacyUser | null = null;
	@Output() userSubmit = new EventEmitter<Omit<LegacyUser, 'id'>>();

	readonly form = new FormGroup({
		pseudo: new FormControl('', [Validators.required, Validators.minLength(3)]),
		email: new FormControl('', [Validators.required, Validators.email]),
		location: new FormGroup({
			address: new FormControl('', [Validators.required, Validators.minLength(5)]),
			country: new FormControl('', [Validators.required]),
		}),
	});

	ngOnChanges(changes: SimpleChanges): void {
		if (!changes['selectedUser']) {
			return;
		}

		if (this.selectedUser) {
			this.form.patchValue({
				pseudo: this.selectedUser.pseudo,
				email: this.selectedUser.email,
				location: this.selectedUser.location,
			});
			return;
		}

		this.form.reset();
	}

	get isEditMode(): boolean {
		return this.selectedUser !== null;
	}

	onSubmit(): void {
		if (!this.form.valid) {
			this.form.markAllAsTouched();
			return;
		}

		this.userSubmit.emit(this.form.getRawValue() as Omit<LegacyUser, 'id'>);
		this.form.reset();
	}
}

