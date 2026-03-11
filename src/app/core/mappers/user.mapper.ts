import { UserApiDto } from '../dto/user-api.dto';
import { CarBrand } from '../models/car-brand.model';
import { Car } from '../models/car.model';
import { User } from '../models/user.model';

/** Mapper entre le DTO distant et l'entite domaine User. */
export class UserMapper {
	private static uuidToNumericId(uuid: string): number {
		let hash = 0;
		for (let i = 0; i < uuid.length; i += 1) {
			hash = (hash << 5) - hash + uuid.charCodeAt(i);
			hash |= 0;
		}

		return Math.abs(hash) || 1;
	}

	static fromApi(dto: UserApiDto): User {
		return {
			id: UserMapper.uuidToNumericId(dto.login.uuid),
			firstName: dto.name.first,
			lastName: dto.name.last,
			email: dto.email,
			gender: dto.gender,
			profession: 'dev_web',
			car: new Car(new CarBrand('Peugeot'), '208', 'Essence', 2022),
			password: dto.login.password,
			address: {
				street: `${dto.location.street.number} ${dto.location.street.name}`.trim(),
				city: dto.location.city,
				postalCode: String(dto.location.postcode ?? ''),
				country: dto.location.country,
			},
		};
	}
}
