import { Locomotive, LocomotiveType } from '../models/locomotive.model';

/**
 * Jeu de données statique pour la démonstration auto-scroll.
 * Contient 30 locomotives couvrant les trois types de traction.
 */
export const LOCOMOTIVES_MOCK: Locomotive[] = [
	new Locomotive(1,  'BB 7200',        'Alstom',          1976, LocomotiveType.ELECTRIC, 'France'),
	new Locomotive(2,  'BB 15000',       'Alstom',          1971, LocomotiveType.ELECTRIC, 'France'),
	new Locomotive(3,  'BB 22200',       'Alstom',          1976, LocomotiveType.ELECTRIC, 'France'),
	new Locomotive(4,  'BB 26000',       'Alstom',          1988, LocomotiveType.ELECTRIC, 'France'),
	new Locomotive(5,  'TGV Duplex',     'Alstom',          1996, LocomotiveType.ELECTRIC, 'France'),
	new Locomotive(6,  'Avelia Horizon', 'Alstom',          2021, LocomotiveType.ELECTRIC, 'France'),
	new Locomotive(7,  'Class 66',       'EMD',             1998, LocomotiveType.DIESEL,   'Royaume-Uni'),
	new Locomotive(8,  'DF4B',           'Dalian',          1985, LocomotiveType.DIESEL,   'Chine'),
	new Locomotive(9,  'SD70ACe',        'EMD',             2005, LocomotiveType.DIESEL,   'États-Unis'),
	new Locomotive(10, 'ES44AC',         'GE Transportation',2004, LocomotiveType.DIESEL,  'États-Unis'),
	new Locomotive(11, 'G2000',          'Vossloh',         2001, LocomotiveType.DIESEL,   'Allemagne'),
	new Locomotive(12, 'Class 08',       'British Railways', 1952, LocomotiveType.DIESEL,   'Royaume-Uni'),
	new Locomotive(13, '241 P',          'SNCF Ateliers',   1948, LocomotiveType.STEAM,    'France'),
	new Locomotive(14, 'Pacific 231',    'Schneider',       1923, LocomotiveType.STEAM,    'France'),
	new Locomotive(15, 'Mallard',        'LNER',            1938, LocomotiveType.STEAM,    'Royaume-Uni'),
	new Locomotive(16, 'Flying Scotsman','GNR',             1923, LocomotiveType.STEAM,    'Royaume-Uni'),
	new Locomotive(17, 'BR 52',          'Borsig',          1942, LocomotiveType.STEAM,    'Allemagne'),
	new Locomotive(18, 'Big Boy',        'ALCO',            1941, LocomotiveType.STEAM,    'États-Unis'),
	new Locomotive(19, 'Re 460',         'SLM / ABB',       1991, LocomotiveType.ELECTRIC, 'Suisse'),
	new Locomotive(20, 'Re 620',         'SLM / ABB',       1987, LocomotiveType.ELECTRIC, 'Suisse'),
	new Locomotive(21, 'BR 101',         'Adtranz',         1996, LocomotiveType.ELECTRIC, 'Allemagne'),
	new Locomotive(22, 'BR 185',         'Bombardier',      2000, LocomotiveType.ELECTRIC, 'Allemagne'),
	new Locomotive(23, 'Vectron MS',     'Siemens',         2013, LocomotiveType.ELECTRIC, 'Allemagne'),
	new Locomotive(24, 'Traxx F140 MS',  'Bombardier',      2004, LocomotiveType.ELECTRIC, 'Allemagne'),
	new Locomotive(25, 'Class 91',       'BREL',            1988, LocomotiveType.ELECTRIC, 'Royaume-Uni'),
	new Locomotive(26, 'ALP-46',         'Bombardier',      2002, LocomotiveType.ELECTRIC, 'États-Unis'),
	new Locomotive(27, 'FS E.656',       'Breda',           1975, LocomotiveType.ELECTRIC, 'Italie'),
	new Locomotive(28, 'FS E.464',       'Bombardier',      1999, LocomotiveType.ELECTRIC, 'Italie'),
	new Locomotive(29, 'GT26CW',         'EMD',             1970, LocomotiveType.DIESEL,   'Brésil'),
	new Locomotive(30, 'Class 47',       'Brush Traction',  1962, LocomotiveType.DIESEL,   'Royaume-Uni'),
];
