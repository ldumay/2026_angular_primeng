import { Component } from '@angular/core';
import { LegacyUsersView as LegacyUsersView } from '../../components/legacy-users/legacy-users-view';

@Component({
	selector: 'app-legacy-users-import-page',
	imports: [LegacyUsersView],
	templateUrl: './legacy-users-import-page.html',
	styleUrl: './legacy-users-import-page.scss',
})
export class LegacyUsersImportPage {}

