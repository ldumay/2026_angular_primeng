import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonDirective } from 'primeng/button';
import { ListboxChangeEvent, ListboxModule } from 'primeng/listbox';
import { LegacyUser } from '../../core/models/legacy-user.model';

@Component({
	selector: 'app-legacy-user-list',
	imports: [CommonModule, FormsModule, ButtonDirective, ListboxModule],
	templateUrl: './legacy-user-list.component.html',
	styleUrl: './legacy-user-list.component.scss',
})
export class LegacyUserListComponent {
	@Input() users: LegacyUser[] = [];
	@Input() selectedUserId: number | null = null;

	@Output() userSelect = new EventEmitter<number | null>();

	onSelectionChange(event: ListboxChangeEvent): void {
		const selectedId = Number(event.value ?? 0);
		if (!selectedId) {
			this.userSelect.emit(null);
			return;
		}

		const next = this.selectedUserId === selectedId ? null : selectedId;
		this.userSelect.emit(next);
	}

	clearSelection(): void {
		this.userSelect.emit(null);
	}
}
