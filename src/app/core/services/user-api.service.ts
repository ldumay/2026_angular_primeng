import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { UserApiListResponseDto } from '../dto/user-api.dto';
import { User } from '../models/user.model';
import { UserMapper } from '../mappers/user.mapper';

/**
 * Service de donnees: isole l'acces HTTP vers une API REST de demonstration.
 */
@Injectable({ providedIn: 'root' })
export class UserApiService {
	private readonly http = inject(HttpClient);
	private readonly baseUrl = 'https://randomuser.me/api';

	listUsers(): Observable<User[]> {
		return this.http
			.get<UserApiListResponseDto>(`${this.baseUrl}/?results=20&nat=fr`)
			.pipe(map((res) => res.results.map(UserMapper.fromApi)));
	}
}
