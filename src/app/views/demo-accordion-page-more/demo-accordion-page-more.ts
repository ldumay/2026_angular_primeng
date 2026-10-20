// Angular
import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal
}
from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

// PrimeNG
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
	selector: 'app-demo-accordion-page-more',
	standalone: true,
	imports: [
    // Angular
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    // PrimeNG
    AccordionModule,
    ButtonModule,
    InputTextModule
    ],
  templateUrl: './demo-accordion-page-more.html',
  styleUrl: './demo-accordion-page-more.scss',
})
export class DemoAccordionPageMore implements OnInit
{
  private fb = inject(FormBuilder);

  active = signal<string | null>('info');

  ngOnInit(): void {
  }

  // Créé UNE fois, à l'instanciation du composant
  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
  });

  submit() {
    if (this.form.valid) console.log(this.form.getRawValue());
  }

}
