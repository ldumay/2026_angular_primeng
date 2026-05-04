import { Component, OnInit } from '@angular/core';
import {
  ControlValueAccessor, NG_VALUE_ACCESSOR, FormArray, FormGroup, 
  FormControl, Validators, ReactiveFormsModule, FormsModule
} from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { SelectModule } from 'primeng/select';

import { ItemsTable } from '../../components/items-table/items-table';

import { OrderItem } from '../../core/models/order-item.model';

@Component({
  selector: 'app-form-width-table-more-page',
  standalone: true, 
  imports: [
    ReactiveFormsModule, FormsModule,
    ButtonModule, InputNumberModule, 
    InputTextModule, TableModule, SelectModule,
    ItemsTable
  ], 
  templateUrl: './form-width-table-more-page.html',
  styleUrl: './form-width-table-more-page.scss',
})
export class FormWidthTableMorePage implements OnInit { 
  form = new FormGroup({ 
  name: new FormControl<string>(''), 
  items: new FormControl<OrderItem[]>([]) });

  ngOnInit() { 
    // Injection de données → writeValue() dans B 
    this.form.patchValue({
      name: 'Commande #001', 
      items: [ 
        { id: 1, name: 'Clavier mécanique', qty: 2, price: 89.90, status: 'ok' },
        { id: 2, name: 'Souris ergonomique', qty: 1, price: 49.50, status: 'pending' }
      ] 
    }); 
  }

  onSubmit() {
    if (this.form.valid) { console.log(this.form.value); } 
  }
}