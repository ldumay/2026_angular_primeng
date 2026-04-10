import { Component, computed, signal } from '@angular/core';
import { LegacyUser } from '../../core/models/legacy-user.model';
import { LegacyUserFormComponent } from './legacy-user-form.component';
import { LegacyUserListComponent } from './legacy-user-list.component';
import { LegacyUserSearchComponent } from './legacy-user-search.component';

@Component({
	selector: 'app-legacy-users-view',
	imports: [LegacyUserSearchComponent, LegacyUserListComponent, LegacyUserFormComponent],
	templateUrl: './legacy-users-view.component.html',
	styleUrl: './legacy-users-view.component.scss',
})
export class LegacyUsersViewComponent {
	readonly users = signal<LegacyUser[]>([
		{
			id: 1,
			pseudo: 'alice',
			email: 'alice@example.com',
			location: { address: '10 rue de Rivoli', country: 'FR' },
		},
	]);

	readonly selectedUserId = signal<number | null>(null);

	readonly selectedUser = computed<LegacyUser | null>(() => {
		const id = this.selectedUserId();
		return this.users().find((u) => u.id === id) ?? null;
	});

	private nextId = 2;

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

