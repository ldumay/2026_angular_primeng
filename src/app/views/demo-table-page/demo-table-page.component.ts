import { Component } from '@angular/core';
import { DemoTableComponent } from '../../components/demo-table/demo-table.component';

@Component({
	selector: 'app-demo-table-page',
	imports: [DemoTableComponent],
	templateUrl: './demo-table-page.component.html',
	styleUrl: './demo-table-page.component.scss',
})
export class DemoTablePageComponent {}

