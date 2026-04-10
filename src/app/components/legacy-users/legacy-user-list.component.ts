import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LegacyUser } from '../../core/models/legacy-user.model';

@Component({
	selector: 'app-legacy-user-list',
	templateUrl: './legacy-user-list.component.html',
	styleUrl: './legacy-user-list.component.scss',
})
export class LegacyUserListComponent {
	@Input() users: LegacyUser[] = [];
	@Input() selectedUserId: number | null = null;

	@Output() userSelect = new EventEmitter<number | null>();

	onSelect(user: LegacyUser): void {
		const next = this.selectedUserId === user.id ? null : user.id;
		this.userSelect.emit(next);
	}

	trackById(_: number, user: LegacyUser): number {
		return user.id;
	}
}

