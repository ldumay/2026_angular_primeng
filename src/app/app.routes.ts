import { Routes } from '@angular/router';
import { HomePageComponent } from './views/home/home-page.component';
import { UsersPageComponent } from './views/users-pages/users-page.component';

export const routes: Routes = [
	{ path: '', component: HomePageComponent },
	{ path: 'users', component: UsersPageComponent },
	{
		path: 'demo-form',
		loadComponent: () =>
			import('./views/demo-form-page/demo-form-page.component').then((m) => m.DemoFormPageComponent),
	},
	{
		path: 'demo-table',
		loadComponent: () =>
			import('./views/demo-table-page/demo-table-page.component').then((m) => m.DemoTablePageComponent),
	},
	{
		path: 'demo-split-button',
		loadComponent: () =>
			import('./views/demo-split-button-page/demo-split-button-page.component').then(
				(m) => m.DemoSplitButtonPageComponent,
			),
	},
	{
		path: 'import-users',
		loadComponent: () =>
			import('./views/legacy-users-import-page/legacy-users-import-page.component').then(
				(m) => m.LegacyUsersImportPageComponent,
			),
	},
	{
		path: 'autocomplete-button-sync',
		loadComponent: () =>
			import('./views/autocomplete-button-sync-page/autocomplete-button-sync-page.component').then(
				(m) => m.AutocompleteButtonSyncPageComponent,
			),
	},
	{
		path: 'lazy-table',
		loadComponent: () =>
			import('./views/lazy-table-page/lazy-table-page').then(
				(m) => m.LazyTablePage,
			),
	},
	{
		path: 'form-width-table',
		loadComponent: () =>
			import('./views/form-width-table-page/form-width-table-page').then(
				(m) => m.FormWidthTablePage,
			),
	},
	{ path: '**', redirectTo: '' },
];
