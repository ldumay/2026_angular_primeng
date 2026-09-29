import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { BadgeModule } from "primeng/badge";
import { ButtonModule } from "primeng/button";

@Component({
	selector: 'demo-accordion-page',
	standalone: true,
	imports: [
		CommonModule,
		ButtonModule,
		BadgeModule
	],
	templateUrl: './demo-accordion-page.html',
	styleUrl: './demo-accordion-page.scss',
})
export class DemoAccordionPage implements OnInit {
    ngOnInit(): void {
		//--
	}
}
