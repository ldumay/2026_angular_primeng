import { AfterViewChecked, Component, computed, ElementRef, Renderer2, signal } from '@angular/core';
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
export class LegacyUsersViewComponent implements AfterViewChecked {
	readonly users = signal<LegacyUser[]>(MOCK_LEGACY_USERS.map((u) => ({ ...u })));

	readonly selectedUserId = signal<number | null>(null);

	readonly selectedUser = computed<LegacyUser | null>(() => {
		const id = this.selectedUserId();
		return this.users().find((u) => u.id === id) ?? null;
	});

	private nextId = MOCK_LEGACY_USERS.length + 1;

	private cardsStyled = false;

	constructor(
		private readonly el: ElementRef,
		private readonly renderer: Renderer2,
	) {}

	ngAfterViewChecked(): void {
		if (this.cardsStyled) {
			return;
		}

		const cards = this.el.nativeElement.querySelectorAll('p-card');
		if (!cards.length) {
			return;
		}

		cards.forEach((cardHost: HTMLElement) => {
			// p-card host
			this.applyFlexStretch(cardHost);

			// .p-card
			const pCard = cardHost.querySelector('.p-card') as HTMLElement | null;
			if (pCard) {
				this.renderer.setStyle(pCard, 'height', '100%');
				this.applyFlexStretch(pCard);
			}

			// .p-card-body
			const pCardBody = cardHost.querySelector('.p-card-body') as HTMLElement | null;
			if (pCardBody) {
				this.applyFlexStretch(pCardBody);
			}

			// .p-card-content
			const pCardContent = cardHost.querySelector('.p-card-content') as HTMLElement | null;
			if (pCardContent) {
				this.applyFlexStretch(pCardContent);
			}
		});

		this.cardsStyled = true;
	}

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

	private applyFlexStretch(element: HTMLElement): void {
		this.renderer.setStyle(element, 'flex', '1');
		this.renderer.setStyle(element, 'display', 'flex');
		this.renderer.setStyle(element, 'flex-direction', 'column');
		this.renderer.setStyle(element, 'min-height', '0');
	}
}
