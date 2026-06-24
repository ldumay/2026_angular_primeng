import {
	Component,
	ElementRef,
	QueryList,
	ViewChildren,
	signal,
	computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { ListboxModule } from 'primeng/listbox';
import { InputTextModule } from 'primeng/inputtext';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { Locomotive, LocomotiveType } from '../../core/models/locomotive.model';
import { LOCOMOTIVES_MOCK } from '../../core/mocks/locomotives.mock';

/**
 * Page de démonstration Auto-Scroll.
 *
 * Concept illustré :
 *  • Un dropdown en haut de page permet de sélectionner rapidement une locomotive.
 *  • La sélection déclenche un scroll automatique vers l'élément correspondant
 *    dans la listbox en bas à gauche, qui synchronise sa propre sélection.
 *  • La sélection dans la listbox affiche les données de la locomotive dans
 *    le formulaire lecture-seule à droite.
 *
 * Architecture :
 *  ┌─────────────────────────────────────────────────┐
 *  │  En-tête (titre + badge nombre)                │
 *  ├─────────────────────────────────────────────────┤
 *  │  Dropdown de sélection rapide (p-select)        │
 *  ├───────────────────────┬─────────────────────────┤
 *  │ Listbox (p-listbox)   │ Formulaire lecture seule│
 *  │ Liste complète        │ Données de l'objet      │
 *  │ Auto-scroll activé    │ sélectionné             │
 *  └───────────────────────┴─────────────────────────┘
 */
@Component({
	selector: 'app-auto-scroll-page',
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		SelectModule,
		ListboxModule,
		InputTextModule,
		DividerModule,
		TagModule,
		CardModule,
	],
	templateUrl: './auto-scroll-page.html',
	styleUrl: './auto-scroll-page.scss',
})
export class AutoScrollPage {
	// -----------------------------------------------------------------------
	// Données
	// -----------------------------------------------------------------------

	/** Liste complète des locomotives disponibles. */
	readonly locomotives: Locomotive[] = LOCOMOTIVES_MOCK;

	/** Options pour le dropdown (même liste que la listbox). */
	readonly dropdownOptions = LOCOMOTIVES_MOCK.map((l) => ({
		label: l.displayName,
		value: l,
	}));

	// -----------------------------------------------------------------------
	// État réactif (Signals)
	// -----------------------------------------------------------------------

	/** Locomotive actuellement sélectionnée (null = aucune sélection). */
	readonly selected = signal<Locomotive | null>(null);

	/** Valeur du dropdown (liée en two-way via ngModel). */
	dropdownValue: Locomotive | null = null;

	/** Valeur de la listbox (liée en two-way via ngModel). */
	listboxValue: Locomotive | null = null;

	// -----------------------------------------------------------------------
	// Libellé du badge de type (computed)
	// -----------------------------------------------------------------------

	/** Sévérité PrimeNG selon le type de traction. */
	readonly typeSeverity = computed(() => {
		switch (this.selected()?.type) {
			case LocomotiveType.ELECTRIC: return 'info';
			case LocomotiveType.DIESEL:   return 'warn';
			case LocomotiveType.STEAM:    return 'danger';
			default:                      return 'secondary';
		}
	});

	/** Icône selon le type de traction. */
	readonly typeIcon = computed(() => {
		switch (this.selected()?.type) {
			case LocomotiveType.ELECTRIC: return 'pi pi-bolt';
			case LocomotiveType.DIESEL:   return 'pi pi-cog';
			case LocomotiveType.STEAM:    return 'pi pi-cloud';
			default:                      return 'pi pi-question';
		}
	});

	// -----------------------------------------------------------------------
	// Référence vers les lignes DOM de la listbox
	// -----------------------------------------------------------------------

	/**
	 * QueryList des éléments <li> / wrappers rendus par p-listbox.
	 * Utilisé pour cibler le nœud DOM à faire scroller.
	 */
	@ViewChildren('listItem') listItems!: QueryList<ElementRef<HTMLElement>>;

	// -----------------------------------------------------------------------
	// Gestionnaires d'événements
	// -----------------------------------------------------------------------

	/**
	 * Appelé lors d'une sélection dans le dropdown.
	 * Synchronise la listbox et déclenche le scroll automatique.
	 */
	onDropdownSelect(loco: Locomotive | null): void {
		if (!loco) return;
		this.selected.set(loco);
		this.listboxValue = loco;
		this._scrollToSelected(loco);
	}

	/**
	 * Appelé lors d'une sélection dans la listbox.
	 * Synchronise le dropdown et met à jour l'état.
	 */
	onListboxSelect(loco: Locomotive | null): void {
		if (!loco) return;
		this.selected.set(loco);
		this.dropdownValue = loco;
	}

	// -----------------------------------------------------------------------
	// Logique de scroll automatique
	// -----------------------------------------------------------------------

	/**
	 * Fait défiler le conteneur de la listbox jusqu'à l'élément correspondant
	 * à la locomotive sélectionnée.
	 *
	 * Stratégie :
	 *  1. Retrouver l'index de la locomotive dans le tableau source.
	 *  2. Cibler le n-ième élément DOM via QueryList<ElementRef>.
	 *  3. Appeler scrollIntoView avec behavior:'smooth' et block:'nearest'
	 *     pour un défilement fluide sans sauts visuels.
	 */
	private _scrollToSelected(loco: Locomotive): void {
		const index = this.locomotives.findIndex((l) => l.id === loco.id);
		if (index < 0) return;

		// Petit délai pour laisser Angular mettre à jour la listbox
		setTimeout(() => {
			const items = this.listItems?.toArray();
			if (!items || index >= items.length) return;
			items[index].nativeElement.scrollIntoView({
				behavior: 'smooth',
				block: 'nearest',
			});
		}, 50);
	}
}
