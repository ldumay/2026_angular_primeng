import { Component, DestroyRef, forwardRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { LegacyUser } from '../../core/models/legacy-user.model';
import { MOCK_LEGACY_USERS } from '../../core/mocks/legacy-users.mock';

@Component({
	selector: 'app-user-autocomplete-demo',
	imports: [ReactiveFormsModule, AutoCompleteModule, ButtonModule],
	templateUrl: './user-autocomplete-demo.component.html',
	styleUrl: './user-autocomplete-demo.component.scss',
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => UserAutocompleteDemoComponent),
			multi: true,
		},
	],
})
export class UserAutocompleteDemoComponent implements ControlValueAccessor {
	private readonly destroyRef = inject(DestroyRef);
	private readonly allUsers: LegacyUser[] = MOCK_LEGACY_USERS.map((u) => ({ ...u }));

	/** FormControl interne lié au p-autocomplete — source de vérité unique. */
	readonly innerControl = new FormControl<LegacyUser[]>([], { nonNullable: true });

	suggestions = signal<LegacyUser[]>([]);
	isDisabled = false;

	private onChange: (val: LegacyUser[]) => void = () => {};
	private onTouched: () => void = () => {};

	constructor() {
		// Propage tout changement venant du p-autocomplete (select / unselect) vers le form parent.
		this.innerControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
			this.onChange(value);
			this.onTouched();
		});
	}

	// ── CVA ──────────────────────────────────────────────────────────────

	writeValue(value: LegacyUser[] | null): void {
		// emitEvent: false → pas de boucle infinie vers le parent
		this.innerControl.setValue(value ?? [], { emitEvent: false });
	}

	registerOnChange(fn: (val: LegacyUser[]) => void): void {
		this.onChange = fn;
	}

	registerOnTouched(fn: () => void): void {
		this.onTouched = fn;
	}

	setDisabledState(isDisabled: boolean): void {
		this.isDisabled = isDisabled;
		if (isDisabled) {
			this.innerControl.disable({ emitEvent: false });
		} else {
			this.innerControl.enable({ emitEvent: false });
		}
	}

	// ── Logique métier ──────────────────────────────────────────────────

	search(event: AutoCompleteCompleteEvent): void {
		const query = event.query.toLowerCase().trim();
		const alreadySelectedIds = new Set(this.innerControl.value.map((u) => u.id));

		const filtered = this.allUsers.filter(
			(u) =>
				!alreadySelectedIds.has(u.id) &&
				(!query || u.pseudo.toLowerCase().includes(query) || u.email.toLowerCase().includes(query)),
		);

		this.suggestions.set(filtered);
	}

	addTwoRandomUsers(): void {
		const current = this.innerControl.value;
		const alreadySelectedIds = new Set(current.map((u) => u.id));
		const available = this.allUsers.filter((u) => !alreadySelectedIds.has(u.id));

		if (available.length === 0) {
			return;
		}

		const shuffled = [...available].sort(() => Math.random() - 0.5);
		const toAdd = shuffled.slice(0, Math.min(2, shuffled.length));

		// setValue est SYNCHRONE → le p-autocomplete est mis à jour immédiatement
		this.innerControl.setValue([...current, ...toAdd]);
	}

	clearAll(): void {
		this.innerControl.setValue([]);
	}
}
