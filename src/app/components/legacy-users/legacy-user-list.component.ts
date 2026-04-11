import { CommonModule } from '@angular/common';
import {
	AfterViewChecked,
	Component,
	ElementRef,
	EventEmitter,
	Input,
	Output,
	Renderer2,
} from '@angular/core';
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
export class LegacyUserListComponent implements AfterViewChecked {
	@Input() users: LegacyUser[] = [];
	@Input() selectedUserId: number | null = null;

	@Output() userSelect = new EventEmitter<number | null>();

	private styled = false;

	constructor(
		private readonly el: ElementRef,
		private readonly renderer: Renderer2,
	) {}

	ngAfterViewChecked(): void {
		if (this.styled) {
			return;
		}

		const pListbox: HTMLElement | null = this.el.nativeElement.querySelector('p-listbox');
		if (!pListbox) {
			return;
		}

		// p-listbox host
		this.applyFlexStretch(pListbox);

		// .p-listbox (inner wrapper)
		const listboxRoot = pListbox.querySelector('.p-listbox') as HTMLElement | null;
		if (listboxRoot) {
			this.applyFlexStretch(listboxRoot);
		}

		// .p-listbox-list-container (scrollable area)
		const listContainer = pListbox.querySelector('.p-listbox-list-container') as HTMLElement | null;
		if (listContainer) {
			this.applyFlexStretch(listContainer);
			this.renderer.setStyle(listContainer, 'overflow-y', 'auto');
		}

		this.styled = true;
	}

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

	private applyFlexStretch(element: HTMLElement): void {
		this.renderer.setStyle(element, 'flex', '1');
		this.renderer.setStyle(element, 'display', 'flex');
		this.renderer.setStyle(element, 'flex-direction', 'column');
		this.renderer.setStyle(element, 'min-height', '0');
	}
}
