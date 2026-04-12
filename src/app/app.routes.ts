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
		path: 'hello-world',
		loadComponent: () =>
			import('./views/hello-world-page/hello-world-page.component').then(
				(m) => m.HelloWorldPageComponent,
			),
	},
	{ path: '**', redirectTo: '' },
];
