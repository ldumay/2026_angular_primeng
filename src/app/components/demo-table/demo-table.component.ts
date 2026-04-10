import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RatingModule } from 'primeng/rating';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DemoProductsService } from '../../core/services/demo-products.service';
import { DemoTableColumn } from '../../core/models/demo/demo-table-column.model';
import { DemoProduct } from '../../core/models/demo/demo-product.model';

@Component({
	selector: 'app-demo-table',
	imports: [CommonModule, FormsModule, RatingModule, TableModule, TagModule],
	templateUrl: './demo-table.component.html',
	styleUrl: './demo-table.component.scss',
})
export class DemoTableComponent implements OnInit {
	private readonly productService = inject(DemoProductsService);

	products: DemoProduct[] = [];
	cols: DemoTableColumn[] = [];
	loading = true;

	async ngOnInit(): Promise<void> {
		this.cols = [
			{ field: 'code', header: 'Code' },
			{ field: 'name', header: 'Name' },
			{ field: 'description', header: 'Description' },
			{ field: 'image', header: 'Image' },
			{ field: 'category', header: 'Category' },
			{ field: 'price', header: 'Price' },
			{ field: 'quantity', header: 'Quantity' },
			{ field: 'rating', header: 'Reviews' },
			{ field: 'inventoryStatus', header: 'Status' },
		];

		this.products = await this.productService.getProducts();
		this.loading = false;
	}

	getSeverity(
		status: string | undefined,
	): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
		switch (status) {
			case 'INSTOCK':
				return 'success';
			case 'LOWSTOCK':
				return 'warn';
			case 'OUTOFSTOCK':
				return 'danger';
			default:
				return 'secondary';
		}
	}
}

