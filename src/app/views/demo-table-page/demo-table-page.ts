import { Component } from '@angular/core';
import { DemoTable as DemoTable } from '../../components/demo-table/demo-table';

@Component({
	selector: 'app-demo-table-page',
	imports: [DemoTable],
	templateUrl: './demo-table-page.html',
	styleUrl: './demo-table-page.scss',
})
export class DemoTablePage {}

