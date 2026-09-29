import { Routes } from '@angular/router';
import { HomePage } from './views/home/home-page';
import { UsersPage } from './views/users-pages/users-page';

export const routes: Routes = [
	{ path: '', component: HomePage },
	{ path: 'users', component: UsersPage },
	{
		path: 'demo-form',
		loadComponent: () =>
			import('./views/demo-form-page/demo-form-page')
		.then((m) => m.DemoFormPage),
	},
	{
		path: 'demo-table',
		loadComponent: () =>
			import('./views/demo-table-page/demo-table-page')
		.then((m) => m.DemoTablePage),
	},
	{
		path: 'demo-split-button',
		loadComponent: () =>
			import('./views/demo-split-button-page/demo-split-button-page')
		.then((m) => m.DemoSplitButtonPage),
	},
	{
		path: 'demo-form-detail',
		loadComponent: () =>
			import('./views/demo-form-detail-page/demo-form-detail-page')
		.then((m) => m.DemoFormDetailPage),
	},
	{
		path: 'import-users',
		loadComponent: () =>
			import('./views/legacy-users-import-page/legacy-users-import-page')
		.then((m) => m.LegacyUsersImportPage),
	},
	{
		path: 'autocomplete-button-sync',
		loadComponent: () =>
			import('./views/autocomplete-button-sync-page/autocomplete-button-sync-page')
		.then((m) => m.AutocompleteButtonSyncPage),
	},
	{
		path: 'lazy-table',
		loadComponent: () =>
			import('./views/lazy-table-page/lazy-table-page')
		.then((m) => m.LazyTablePage),
	},
	{
		path: 'form-width-table',
		loadComponent: () =>
			import('./views/form-width-table-page/form-width-table-page')
		.then((m) => m.FormWidthTablePage),
	},
	{
		path: 'form-width-table-more',
		loadComponent: () =>
			import('./views/form-width-table-more-page/form-width-table-more-page')
		.then((m) => m.FormWidthTableMorePage),
	},
	{
		path: 'auto-scroll',
		loadComponent: () =>
			import('./views/auto-scroll-page/auto-scroll-page')
		.then((m) => m.AutoScrollPage),
	},
	{
		path: 'locomotives',
		loadComponent: () =>
			import('./views/locomotives-page/locomotives-page')
		.then((m) => m.LocomotivesPage),
	},
	{
		path: 'locomotives-complex',
		loadComponent: () =>
			import('./views/locomotives-complex-page/locomotives-complex-page')
		.then((m) => m.LocomotivesComplexPage),
	},
	{
		path: 'demo-accordion',
		loadComponent: () =>
			import('./views/demo-accordion-page/demo-accordion-page')
		.then((m) => m.DemoAccordionPage),
	},
	{ path: '**', redirectTo: '' },
];
