import { Component } from '@angular/core';
import { DemoFormComponent } from '../../components/demo-form/demo-form.component';

@Component({
	selector: 'app-demo-form-page',
	imports: [DemoFormComponent],
	templateUrl: './demo-form-page.component.html',
	styleUrl: './demo-form-page.component.scss',
})
export class DemoFormPageComponent {}

