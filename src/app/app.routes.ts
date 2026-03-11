import { Routes } from '@angular/router';
import { HomePageComponent } from './views/home/home-page.component';
import { UsersPageComponent } from './views/users-pages/users-page.component';

export const routes: Routes = [
	{ path: '', component: HomePageComponent },
	{ path: 'users', component: UsersPageComponent },
	{ path: '**', redirectTo: '' },
];
