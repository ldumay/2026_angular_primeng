import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ProfessionOption } from '../models/profession-option.model';

/**
 * Service dedie aux donnees mockees de professions.
 * Isole la source de donnees pour pouvoir la remplacer par une API plus tard.
 */
@Injectable({ providedIn: 'root' })
export class ProfessionMockService {
	private readonly professionOptions: ProfessionOption[] = [
		{ code: 'dev_web', label: 'Developpeur Web' },
		{ code: 'qa', label: 'Ingenieur QA' },
		{ code: 'pm', label: 'Chef de Projet' },
		{ code: 'ux_ui', label: 'Designer UX/UI' },
		{ code: 'data', label: 'Data Analyst' },
		{ code: 'admin_sys', label: 'Administrateur Systeme' },
		{ code: 'devops', label: 'Ingenieur DevOps' },
		{ code: 'support', label: 'Technicien Support' },
	];

	listProfessions(): Observable<ProfessionOption[]> {
		return of([...this.professionOptions]);
	}
}
