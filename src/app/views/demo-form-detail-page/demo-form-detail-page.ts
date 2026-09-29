// Angular
import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from '@angular/forms';
import { OnInit } from '@angular/core';

// PrimeNG
import { CardModule } from "primeng/card";
import { CheckboxModule } from 'primeng/checkbox';
import { ColorPickerModule } from 'primeng/colorpicker';
import { DatePickerModule } from 'primeng/datepicker';
import { DividerModule } from 'primeng/divider';
import { EditorModule } from 'primeng/editor';
import { FloatLabelModule } from 'primeng/floatlabel';
import { IftaLabelModule } from 'primeng/iftalabel';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputOtpModule } from 'primeng/inputotp';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { RatingModule } from 'primeng/rating';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SelectModule } from 'primeng/select';
import { SliderModule } from 'primeng/slider';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
	selector: 'demo-form-detail-page',
	standalone: true,
	imports: [
        // Angular
        CommonModule,
        FormsModule,
        // PrimeNG
        CardModule,
        CheckboxModule,
        ColorPickerModule,
        DatePickerModule,
        DividerModule,
        EditorModule,
        FloatLabelModule,
        IftaLabelModule,
        InputOtpModule,
        InputTextModule,
        InputGroupModule,
        InputGroupAddonModule,
        RadioButtonModule,
        RatingModule,
        SelectButtonModule,
        SelectModule,
        SliderModule,
        ToggleButtonModule,
        ToggleSwitchModule
    ],
	templateUrl: './demo-form-detail-page.html',
	styleUrl: './demo-form-detail-page.scss',
})
export class DemoFormDetailPage implements OnInit
{
    // Sample text input values for the floatlabel fields
    valueA: string = 'demo value A';
    valueB: string = 'demo value B';
    valueC: string = 'demo value C';
    valueD: string = 'http://www.demo.com';

    // Sample city selection for the dropdown
    selectedCity: City | undefined;
    cities: City[] = [];

    // Sample SSN value for the input mask field
    valueE: string = '123-45-6789';

    // Sample OTP value for the input OTP fields
    valueF: number = 6489;
    valueG: number = 5198;
    valueH: number = 3948;

    // Sample date values for the datepicker fields
    date1: Date | undefined;
    date2: Date | undefined;

    // Sample color values for the color picker fields
    color: string = '#6466f1';
    colorRGB: any = { r: 100, g: 102, b: 241 };
    colorHSB: any = { h: 239, s: 59, b: 95 };

    // Sample toggle button values
    checked: boolean = true;
    toggle1: boolean = true;
    toggle2: boolean = true;
    toggle3: boolean = true;

    // Sample slider value
    slider: number = 50;

    // Sample value for the select button field
    paymentOption!: number;
    paymentOptions: any[] = [
        { name: 'Credit Card', value: 'credit' },
        { name: 'PayPal', value: 'paypal' },
        { name: 'Bitcoin', value: 'bitcoin' }
    ];

    // Sample rating value
    rating: number = 5;

    // Sample ingredient value for the radio button field
    ingredient: string = 'Cheese';

    // Sample editor
    editor: string = '<div>Hello World!</div><div>PrimeNG <b>Editor</b> Rocks</div><div><br></div>';

    ngOnInit(): void {
        const newCities = [
            { name: 'New York', code: 'NY' },
            { name: 'Rome', code: 'RM' },
            { name: 'London', code: 'LDN' },
            { name: 'Istanbul', code: 'IST' },
            { name: 'Paris', code: 'PRS' }
        ];
        this.cities = newCities;

        const today = new Date();
        this.date1 = today;
        this.date2 = today;
    }
}

interface City {
    name: string;
    code: string;
}
