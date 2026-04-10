import { Component } from '@angular/core';
import { LegacyUsersViewComponent } from '../../components/legacy-users/legacy-users-view.component';

@Component({
	selector: 'app-legacy-users-import-page',
	imports: [LegacyUsersViewComponent],
	templateUrl: './legacy-users-import-page.component.html',
	styleUrl: './legacy-users-import-page.component.scss',
})
export class LegacyUsersImportPageComponent {}

