export interface DemoProduct {
	id?: string;
	code?: string;
	name?: string;
	description?: string;
	price?: number;
	quantity?: number;
	inventoryStatus?: 'INSTOCK' | 'LOWSTOCK' | 'OUTOFSTOCK';
	category?: string;
	image?: string;
	rating?: number;
}

