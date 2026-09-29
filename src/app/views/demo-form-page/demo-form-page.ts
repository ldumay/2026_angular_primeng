import { Component } from '@angular/core';
import { DemoForm as DemoForm } from '../../components/demo-form/demo-form';

@Component({
	selector: 'app-demo-form-page',
	imports: [DemoForm],
	templateUrl: './demo-form-page.html',
	styleUrl: './demo-form-page.scss',
})
export class DemoFormPage {}

