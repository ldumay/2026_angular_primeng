import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ButtonDirective } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { User } from '../../core/models/user.model';

/** Composant de presentation de la liste utilisateurs. */
@Component({
	selector: 'app-users-list',
	imports: [CommonModule, TableModule, ButtonDirective, InputText],
	templateUrl: './users-list.component.html',
	styleUrl: './users-list.component.scss',
})
export class UsersListComponent {
	@Input({ required: true }) users: User[] = [];

	@Output() edit = new EventEmitter<User>();
	@Output() remove = new EventEmitter<User>();
	@Output() clearAll = new EventEmitter<void>();
}
