import { Component, forwardRef, OnInit, OnDestroy } from '@angular/core';
import {
  AbstractControl, ControlValueAccessor, NG_VALUE_ACCESSOR, FormArray, FormGroup,
  FormControl, Validators, ReactiveFormsModule, FormsModule
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { SelectModule } from 'primeng/select';

import { OrderItem } from '../../core/models/order-item.model';

@Component({
  selector: 'items-table',
  standalone: true,
  imports: [
    ReactiveFormsModule, FormsModule,
    ButtonModule, InputNumberModule, SelectModule,
    InputTextModule, TableModule
  ],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => ItemsTable),
    multi: true
  }],
  templateUrl: './items-table.html',
  styleUrl: './items-table.scss',
})
export class ItemsTable implements ControlValueAccessor, OnInit, OnDestroy {
  rows = new FormArray<FormGroup>([]);
  private onChange: (v: OrderItem[]) => void = () => {};
  private onTouched: () => void = () => {};
  private sub?: Subscription;

  statusOptions = [
    { label: 'OK', value: 'ok' },
    { label: 'En attente', value: 'pending' },
    { label: 'Erreur', value: 'error' }
  ];

  ngOnInit() {
    this.sub = this.rows.valueChanges.pipe(
      debounceTime(0)
    ).subscribe(val => {
      this.onChange(val as OrderItem[]);
      this.onTouched();
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  writeValue(items: OrderItem[] | null): void {
    this.rows.clear({ emitEvent: false });
    (items ?? []).forEach(item => this.rows.push(this.buildGroup(item), { emitEvent: false }));
  }

  registerOnChange(fn: any) { this.onChange = fn; }

  registerOnTouched(fn: any) { this.onTouched = fn; }

  setDisabledState(disabled: boolean) { disabled ? this.rows.disable() : this.rows.enable(); }

  addRow() {
    this.rows.push(this.buildGroup({
      id: Date.now(),
      name: '',
      qty: 1,
      price: 0,
      status: 'pending'
    }));
  }

  removeRow(i: number) {
    this.rows.removeAt(i);
  }

  asGroup(ctrl: AbstractControl): FormGroup {
    return ctrl as FormGroup;
  }

  private buildGroup(item: OrderItem): FormGroup {
    return new FormGroup({
      id: new FormControl(item.id),
      name: new FormControl(item.name, Validators.required),
      qty: new FormControl(item.qty, [Validators.required, Validators.min(1)]),
      price: new FormControl(item.price, Validators.min(0)),
      status: new FormControl(item.status)
    });
  }
}
