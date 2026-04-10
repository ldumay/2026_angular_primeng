export interface LegacyLocation {
	address: string;
	country: string;
}

export interface LegacyUser {
	id: number;
	pseudo: string;
	email: string;
	location: LegacyLocation;
}

