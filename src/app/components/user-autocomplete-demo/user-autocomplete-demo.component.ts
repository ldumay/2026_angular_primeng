import { Component, forwardRef, signal } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { LegacyUser } from '../../core/models/legacy-user.model';
import { MOCK_LEGACY_USERS } from '../../core/mocks/legacy-users.mock';

@Component({
	selector: 'app-user-autocomplete-demo',
	imports: [FormsModule, AutoCompleteModule, ButtonModule],
	templateUrl: './user-autocomplete-demo.component.html',
	styleUrl: './user-autocomplete-demo.component.scss',
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => UserAutocompleteDemoComponent),
			multi: true,
		},
	],
})
export class UserAutocompleteDemoComponent implements ControlValueAccessor {
	private readonly allUsers: LegacyUser[] = MOCK_LEGACY_USERS.map((u) => ({ ...u }));

	selectedUsers: LegacyUser[] = [];
	suggestions = signal<LegacyUser[]>([]);
	isDisabled = false;

	private onChange: (val: LegacyUser[]) => void = () => {};
	private onTouched: () => void = () => {};

	writeValue(value: LegacyUser[] | null): void {
		this.selectedUsers = value ?? [];
	}

	registerOnChange(fn: (val: LegacyUser[]) => void): void {
		this.onChange = fn;
	}

	registerOnTouched(fn: () => void): void {
		this.onTouched = fn;
	}

	setDisabledState(isDisabled: boolean): void {
		this.isDisabled = isDisabled;
	}

	search(event: AutoCompleteCompleteEvent): void {
		const query = event.query.toLowerCase().trim();
		const alreadySelectedIds = new Set(this.selectedUsers.map((u) => u.id));

		const filtered = this.allUsers.filter(
			(u) =>
				!alreadySelectedIds.has(u.id) &&
				(!query || u.pseudo.toLowerCase().includes(query) || u.email.toLowerCase().includes(query)),
		);

		this.suggestions.set(filtered);
	}

	onSelectionChange(): void {
		this.onChange(this.selectedUsers);
		this.onTouched();
	}

	addTwoRandomUsers(): void {
		const alreadySelectedIds = new Set(this.selectedUsers.map((u) => u.id));
		const available = this.allUsers.filter((u) => !alreadySelectedIds.has(u.id));

		if (available.length === 0) {
			return;
		}

		const shuffled = [...available].sort(() => Math.random() - 0.5);
		const toAdd = shuffled.slice(0, Math.min(2, shuffled.length));

		this.selectedUsers = [...this.selectedUsers, ...toAdd];
		this.onChange(this.selectedUsers);
		this.onTouched();
	}

	clearAll(): void {
		this.selectedUsers = [];
		this.onChange(this.selectedUsers);
		this.onTouched();
	}
}
