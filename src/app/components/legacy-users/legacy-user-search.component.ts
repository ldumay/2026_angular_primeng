import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
	AutoCompleteCompleteEvent,
	AutoCompleteModule,
	AutoCompleteSelectEvent,
} from 'primeng/autocomplete';
import { LegacyUser } from '../../core/models/legacy-user.model';

@Component({
	selector: 'app-legacy-user-search',
	imports: [AutoCompleteModule, FormsModule],
	templateUrl: './legacy-user-search.component.html',
	styleUrl: './legacy-user-search.component.scss',
})
export class LegacyUserSearchComponent {
	@Input() users: LegacyUser[] = [];
	@Output() userSelect = new EventEmitter<number | null>();

	selectedUser: LegacyUser | null = null;
	readonly suggestions = signal<LegacyUser[]>([]);

	search(event: AutoCompleteCompleteEvent): void {
		const query = event.query.toLowerCase().trim();
		if (!query) {
			this.suggestions.set([...this.users]);
			return;
		}

		this.suggestions.set(
			this.users.filter(
				(user) =>
					user.pseudo.toLowerCase().includes(query) || user.email.toLowerCase().includes(query),
			),
		);
	}

	onSelect(event: AutoCompleteSelectEvent): void {
		const user = event.value as LegacyUser;
		this.userSelect.emit(user.id);
	}

	onClear(): void {
		this.selectedUser = null;
		this.userSelect.emit(null);
	}
}

