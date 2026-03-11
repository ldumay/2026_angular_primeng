import { Injectable, computed, signal } from '@angular/core';
import { User } from '../core/models/user.model';
import { UserApiService } from '../core/services/user-api.service';

/**
 * Facade metier: centralise l'etat reactif des utilisateurs
 * et les operations CRUD cote client.
 */
@Injectable({ providedIn: 'root' })
export class UsersFacade {
	private readonly usersState = signal<User[]>([]);
	private readonly selectedUserIdState = signal<number | null>(null);

	readonly users = computed(() => this.usersState());
	readonly selectedUser = computed(() => {
		const id = this.selectedUserIdState();
		if (id === null) {
			return null;
		}

		return this.usersState().find((u) => u.id === id) ?? null;
	});

	constructor(private readonly api: UserApiService) {}

	load(): void {
		this.api.listUsers().subscribe({
			next: (users) => this.usersState.set(users),
			error: (err) => {
				console.error('Erreur de chargement des utilisateurs:', err);
				this.usersState.set([]);
			},
		});
	}

	select(user: User | null): void {
		this.selectedUserIdState.set(user?.id ?? null);
	}

	create(user: User): void {
		const maxId = this.usersState().reduce((acc, curr) => Math.max(acc, curr.id), 0);
		this.usersState.set([{ ...user, id: maxId + 1 }, ...this.usersState()]);
	}

	update(user: User): void {
		this.usersState.set(this.usersState().map((u) => (u.id === user.id ? user : u)));
	}

	remove(id: number): void {
		this.usersState.set(this.usersState().filter((u) => u.id !== id));
		if (this.selectedUserIdState() === id) {
			this.selectedUserIdState.set(null);
		}
	}

	clearAll(): void {
		this.usersState.set([]);
		this.selectedUserIdState.set(null);
	}
}
