import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { User } from '../models/user.model';
import { MOCK_USERS } from '../mocks/users.mock';

/**
 * Service de donnees: fournit les utilisateurs depuis une base de mocks locale.
 */
@Injectable({ providedIn: 'root' })
export class UserApiService {
	listUsers(): Observable<User[]> {
		return of(MOCK_USERS.map((u) => ({ ...u })));
	}
}
