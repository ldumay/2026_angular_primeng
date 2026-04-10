import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MenuItem, MessageService } from 'primeng/api';
import { SplitButtonModule } from 'primeng/splitbutton';
import { ToastModule } from 'primeng/toast';

@Component({
	selector: 'app-demo-split-button',
	imports: [CommonModule, SplitButtonModule, ButtonModule, ToastModule],
	providers: [MessageService],
	templateUrl: './demo-split-button.component.html',
	styleUrl: './demo-split-button.component.scss',
})
export class DemoSplitButtonComponent {
	lastAction = '';

	constructor(private readonly messageService: MessageService) {}

	readonly items: MenuItem[] = [
		{
			label: 'Sauvegarder & Fermer',
			icon: 'pi pi-save',
			command: () => this.log('Sauvegarder & Fermer'),
		},
		{
			label: 'Sauvegarder comme brouillon',
			icon: 'pi pi-pencil',
			command: () => this.log('Brouillon sauvegardé'),
		},
		{ separator: true },
		{
			label: 'Dupliquer',
			icon: 'pi pi-copy',
			badge: 'NEW',
			command: () => this.log('Élément dupliqué'),
		},
		{
			label: 'Archiver',
			icon: 'pi pi-inbox',
			disabled: true,
		},
		{ separator: true },
		{
			label: 'Supprimer',
			icon: 'pi pi-trash',
			styleClass: 'text-red-500',
			command: () => this.log('Suppression demandée', 'warn'),
		},
	];

	readonly exportItems: MenuItem[] = [
		{
			label: 'Exporter en PDF',
			icon: 'pi pi-file-pdf',
			command: () => this.onExport('PDF'),
		},
		{
			label: 'Exporter en Excel',
			icon: 'pi pi-file-excel',
			command: () => this.onExport('Excel'),
		},
		{
			label: 'Exporter en CSV',
			icon: 'pi pi-file',
			command: () => this.onExport('CSV'),
		},
		{ separator: true },
		{
			label: 'Partager',
			icon: 'pi pi-share-alt',
			items: [
				{
					label: 'Par email',
					icon: 'pi pi-envelope',
					command: () => this.log('Partage email'),
				},
				{
					label: 'Copier le lien',
					icon: 'pi pi-link',
					command: () => this.log('Lien copié'),
				},
			],
		},
	];

	onDefaultAction(): void {
		this.log('Action principale : Sauvegarder');
	}

	onExport(format: string): void {
		this.log(`Export : ${format}`);
	}

	private log(msg: string, severity: string = 'info'): void {
		this.lastAction = msg;
		this.messageService.add({
			severity,
			summary: msg,
			life: 2500,
		});
	}
}

