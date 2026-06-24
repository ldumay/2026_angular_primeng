import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Locomotive, LocomotiveType } from '../models/locomotive.model';

// ---------------------------------------------------------------------------
// Données de référence pour la génération des locomotives
// Ces tableaux servent à la fois pour le dataset initial (déterministe)
// et pour la génération aléatoire dans le dropdown d'ajout.
// ---------------------------------------------------------------------------

/** Séries / classes de locomotives réelles ou inspirées du réel */
const SERIES_POOL: string[] = [
	'BB 7200', 'BB 9300', 'BB 15000', 'BB 22200', 'BB 25500', 'BB 26000',
	'CC 6500', 'CC 72000', 'CC 21000',
	'TGV Duplex', 'TGV Atlantique', 'TGV Réseau',
	'Class 66', 'Class 47', 'Class 37', 'Class 91',
	'BR 101', 'BR 185', 'BR 189', 'BR 218',
	'Re 460', 'Re 4/4', 'Re 6/6',
	'E 444', 'E 402', 'E 656',
	'ICE 1', 'ICE 3', 'ICE 4',
	'Eurostar e320', 'Thalys PBA',
	'Series 700', 'Series 500', 'Series N700',
	'SD70ACe', 'ES44AC', 'AC4400CW',
	'DR 01', 'DR 50', 'DR 58',
	'FS E.636', 'FS E.656', 'FS ETR 500',
];

/** Constructeurs ferroviaires réels */
const MANUFACTURER_POOL: string[] = [
	'Alstom', 'Siemens', 'Bombardier', 'Stadler', 'CAF', 'Talgo',
	'Hitachi', 'Kawasaki', 'Mitsubishi', 'CRRC',
	'EMD (Electro-Motive Diesel)', 'GE Transportation',
	'SNCF Ateliers', 'DB Systemtechnik',
	'Fiat Ferroviaria', 'Ansaldo Breda',
	'Škoda Transportation', 'Pesa', 'Newag',
];

/** Pays d'origine */
const COUNTRY_POOL: string[] = [
	'France', 'Allemagne', 'Suisse', 'Italie', 'Espagne',
	'Royaume-Uni', 'Japon', 'États-Unis', 'Chine', 'Pologne',
	'République tchèque', 'Autriche', 'Belgique',
];

/** Types de traction disponibles */
const TYPE_POOL: LocomotiveType[] = [
	LocomotiveType.ELECTRIC,
	LocomotiveType.ELECTRIC,
	LocomotiveType.DIESEL,   // doublon intentionnel : plus d'électriques (réalisme)
	LocomotiveType.STEAM,
];

/** Plage d'années de mise en service */
const YEAR_MIN = 1920;
const YEAR_MAX = 2024;

/** Délai simulé d'un appel HTTP (en ms) */
const SIMULATED_DELAY_MS = 300;

/** Taille du dataset initial */
const DATASET_SIZE = 100;

// ---------------------------------------------------------------------------

/**
 * Service mock simulant un backend pour les locomotives.
 *
 * Responsabilités :
 * 1. Générer et stocker un dataset de `DATASET_SIZE` locomotives (déterministe)
 * 2. Exposer une méthode `getPage()` simulant un appel HTTP paginé
 * 3. Exposer une méthode `generateRandom()` pour le dropdown d'ajout
 *
 * Aucune dépendance HTTP réelle : tout est calculé en mémoire.
 */
@Injectable({ providedIn: 'root' })
export class LocomotiveMockService {
	/**
	 * Dataset complet généré une seule fois à l'initialisation du service.
	 * Les données sont déterministes : même index → même locomotive.
	 * Ce tableau sert de « base de données » côté client.
	 */
	private readonly dataset: Locomotive[] = this.buildDataset(DATASET_SIZE);

	/**
	 * Retourne une « page » de données de manière lazy.
	 *
	 * @param offset  Index du premier élément à retourner (0-based)
	 * @param size    Nombre d'éléments à retourner
	 * @returns Observable émettant { items, total } après un délai simulé
	 *
	 * Mécanique :
	 * - On tranche `dataset` avec `slice(offset, offset + size)`
	 * - On enveloppe dans un `Observable` avec `delay()` pour simuler la latence réseau
	 * - Le `total` correspond à la taille du dataset APRÈS ajouts/suppressions éventuels
	 */
	getPage(
		offset: number,
		size: number,
		currentDataset: Locomotive[],
	): Observable<{ items: Locomotive[]; total: number }> {
		const items = currentDataset.slice(offset, offset + size);
		return of({ items, total: currentDataset.length }).pipe(delay(SIMULATED_DELAY_MS));
	}

	/**
	 * Génère `count` locomotives aléatoires pour le dropdown d'ajout.
	 * Les données sont tirées aléatoirement depuis les pools de référence.
	 * Chaque locomotive reçoit un id négatif temporaire (sera remplacé à l'ajout).
	 *
	 * @param count  Nombre de locomotives à générer
	 * @returns Tableau de locomotives aléatoires
	 */
	generateRandom(count: number): Locomotive[] {
		return Array.from({ length: count }, (_, i) => this.buildRandom(-(i + 1)));
	}

	/**
	 * Retourne une copie du dataset initial pour initialisation de la facade.
	 */
	getInitialDataset(): Locomotive[] {
		// On retourne une copie pour éviter la mutation directe du dataset interne
		return [...this.dataset];
	}

	// -------------------------------------------------------------------------
	// Méthodes privées de construction
	// -------------------------------------------------------------------------

	/**
	 * Construit un dataset de `size` locomotives déterministes.
	 * Chaque locomotive est générée depuis les pools via un index cyclique.
	 * Cela garantit la cohérence des données d'une session à l'autre.
	 */
	private buildDataset(size: number): Locomotive[] {
		return Array.from({ length: size }, (_, i) => {
			const id = i + 1;
			return new Locomotive(
				id,
				SERIES_POOL[i % SERIES_POOL.length],
				MANUFACTURER_POOL[i % MANUFACTURER_POOL.length],
				YEAR_MIN + (i * 7) % (YEAR_MAX - YEAR_MIN + 1), // distribution uniforme des années
				TYPE_POOL[i % TYPE_POOL.length],
				COUNTRY_POOL[i % COUNTRY_POOL.length],
			);
		});
	}

	/**
	 * Construit une locomotive aléatoire avec les pools de référence.
	 * Utilisé uniquement pour le dropdown de génération.
	 */
	private buildRandom(id: number): Locomotive {
		return new Locomotive(
			id,
			SERIES_POOL[Math.floor(Math.random() * SERIES_POOL.length)],
			MANUFACTURER_POOL[Math.floor(Math.random() * MANUFACTURER_POOL.length)],
			YEAR_MIN + Math.floor(Math.random() * (YEAR_MAX - YEAR_MIN + 1)),
			TYPE_POOL[Math.floor(Math.random() * TYPE_POOL.length)],
			COUNTRY_POOL[Math.floor(Math.random() * COUNTRY_POOL.length)],
		);
	}
}
