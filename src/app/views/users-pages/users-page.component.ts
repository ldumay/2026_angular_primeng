import { Component, OnInit, inject } from '@angular/core';
import { Card } from 'primeng/card';
import { UsersListComponent } from '../../components/users-list/users-list.component';
import { UserFormComponent } from '../../components/user-form/user-form.component';
import { UsersFacade } from '../../states/users.facade';
import { User } from '../../core/models/user.model';

/** Page de gestion utilisateurs (liste + formulaire). */
@Component({
	selector: 'app-users-page',
	imports: [Card, UsersListComponent, UserFormComponent],
	templateUrl: './users-page.component.html',
	styleUrl: './users-page.component.scss',
})
export class UsersPageComponent implements OnInit {
	readonly facade = inject(UsersFacade);

	ngOnInit(): void {
		this.facade.load();
	}

	onEdit(user: User): void {
		this.facade.select(user);
	}

	onCreate(user: User): void {
		this.facade.create(user);
	}

	onUpdate(user: User): void {
		this.facade.update(user);
	}

	onDelete(user: User): void {
		this.facade.remove(user.id);
	}

	onClearAll(): void {
		this.facade.clearAll();
	}

	clearSelection(): void {
		this.facade.select(null);
	}
}
