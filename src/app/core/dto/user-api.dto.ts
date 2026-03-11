/** DTO d'identifiant venant de randomuser.me. */
export interface RandomUserIdDto {
	name: string;
	value: string | null;
}

/** DTO des informations d'authentification randomuser.me. */
export interface RandomUserLoginDto {
	uuid: string;
	password: string;
}

/** DTO du nom randomuser.me. */
export interface RandomUserNameDto {
	first: string;
	last: string;
}

/** DTO de rue randomuser.me. */
export interface RandomUserStreetDto {
	number: number;
	name: string;
}

/** DTO d'adresse randomuser.me. */
export interface RandomUserLocationDto {
	street: RandomUserStreetDto;
	city: string;
	postcode: string | number;
	country: string;
}

/** DTO utilisateur renvoye par randomuser.me. */
export interface UserApiDto {
	id: RandomUserIdDto;
	login: RandomUserLoginDto;
	name: RandomUserNameDto;
	email: string;
	location: RandomUserLocationDto;
}

/** DTO enveloppe de reponse liste utilisateurs de randomuser.me. */
export interface UserApiListResponseDto {
	results: UserApiDto[];
}
