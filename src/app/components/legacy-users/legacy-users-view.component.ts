import { Component, computed, signal } from '@angular/core';
import { Card } from 'primeng/card';
import { LegacyUser } from '../../core/models/legacy-user.model';
import { MOCK_LEGACY_USERS } from '../../core/mocks/legacy-users.mock';
import { LegacyUserFormComponent } from './legacy-user-form.component';
import { LegacyUserListComponent } from './legacy-user-list.component';
import { LegacyUserSearchComponent } from './legacy-user-search.component';

@Component({
	selector: 'app-legacy-users-view',
	imports: [Card, LegacyUserSearchComponent, LegacyUserListComponent, LegacyUserFormComponent],
	templateUrl: './legacy-users-view.component.html',
	styleUrl: './legacy-users-view.component.scss',
})
export class LegacyUsersViewComponent {
	readonly users = signal<LegacyUser[]>(MOCK_LEGACY_USERS.map((u) => ({ ...u })));

	readonly selectedUserId = signal<number | null>(null);

	readonly selectedUser = computed<LegacyUser | null>(() => {
		const id = this.selectedUserId();
		return this.users().find((u) => u.id === id) ?? null;
	});

	private nextId = MOCK_LEGACY_USERS.length + 1;

	onUserSelect(id: number | null): void {
		this.selectedUserId.set(id);
	}

	onUserSubmit(userData: Omit<LegacyUser, 'id'>): void {
		if (this.selectedUserId() !== null) {
			this.users.update((list) =>
				list.map((u) => (u.id === this.selectedUserId() ? { ...u, ...userData } : u)),
			);
			this.selectedUserId.set(null);
			return;
		}

		const newUser: LegacyUser = { id: this.nextId++, ...userData };
		this.users.update((list) => [...list, newUser]);
	}
}
