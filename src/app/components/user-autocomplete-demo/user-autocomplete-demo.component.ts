import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutoCompleteCompleteEvent, AutoCompleteModule, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { DividerModule } from 'primeng/divider';
import { LegacyUser } from '../../core/models/legacy-user.model';
import { MOCK_LEGACY_USERS } from '../../core/mocks/legacy-users.mock';

@Component({
	selector: 'app-user-autocomplete-demo',
	imports: [FormsModule, AutoCompleteModule, ButtonModule, ChipModule, DividerModule],
	templateUrl: './user-autocomplete-demo.component.html',
	styleUrl: './user-autocomplete-demo.component.scss',
})
export class UserAutocompleteDemoComponent {
	private readonly allUsers: LegacyUser[] = MOCK_LEGACY_USERS.map((u) => ({ ...u }));

	selectedUsers: LegacyUser[] = [];
	suggestions = signal<LegacyUser[]>([]);

	search(event: AutoCompleteCompleteEvent): void {
		const query = event.query.toLowerCase().trim();

		const alreadySelectedIds = new Set(this.selectedUsers.map((u) => u.id));

		if (!query) {
			this.suggestions.set(this.allUsers.filter((u) => !alreadySelectedIds.has(u.id)));
			return;
		}

		this.suggestions.set(
			this.allUsers.filter(
				(u) =>
					!alreadySelectedIds.has(u.id) &&
					(u.pseudo.toLowerCase().includes(query) || u.email.toLowerCase().includes(query)),
			),
		);
	}

	onSelect(event: AutoCompleteSelectEvent): void {
		// La sélection multiple est gérée automatiquement par ngModel
	}

	onUnselect(): void {
		// La déselection est gérée automatiquement par ngModel
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
	}

	clearAll(): void {
		this.selectedUsers = [];
	}
}

