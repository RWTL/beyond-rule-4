import { Component, OnInit, OnChanges, SimpleChanges, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { timer } from 'rxjs/observable/timer';
import { debounce } from 'rxjs/operators';

import { CalculateInput } from '../../models/calculate-input.model';

@Component({
  selector: 'app-basic-input',
  templateUrl: 'basic-input.component.html'
})

export class BasicInputComponent implements OnInit, OnChanges {
  @Input() calculateInput: CalculateInput;
  @Output() calculateInputChange = new EventEmitter<CalculateInput>();

  basicInputForm: FormGroup;

  private currentFormValues = '';

  constructor(private formBuilder: FormBuilder) {
    this.basicInputForm = this.formBuilder.group({
      netWorth: [0, [Validators.required]],
      annualExpenses: [0, [Validators.required]],
      annualSafeWithdrawalRate: [0, [Validators.required]],
      expectedAnnualGrowthRate: [0, [Validators.required]],
      monthlyContribution: [0, [Validators.required]],
      leanFiPercentage: [0, [Validators.required]],
    });
  }

  ngOnInit() {
    this.onFormChanges();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.calculateInput && changes.calculateInput.currentValue) {
      this.basicInputForm.setValue(this.mapModelToForm(changes.calculateInput.currentValue));
    }
  }

  onFormChanges(): void {
    const debounced = this.basicInputForm.valueChanges.pipe(debounce(() => timer(300)));
    debounced.subscribe(val => {
      if (this.basicInputForm.valid && !this.basicInputForm.pristine) {
        const formValues = JSON.stringify(val);
        if (this.currentFormValues === formValues) {
          return;
        }
        this.currentFormValues = formValues;
        this.calculateInputChange.emit(this.mapFormToModel(val));
      }
    });
  }

  private mapFormToModel(formInput: CalculateInput) {
    const result = new CalculateInput(formInput);
    result.expectedAnnualGrowthRate /= 100;
    result.annualSafeWithdrawalRate /= 100;
    result.leanFiPercentage /= 100;
    result.roundAll();
    return result;
  }

  private mapModelToForm(modelInput) {
    const result = new CalculateInput(modelInput);
    result.expectedAnnualGrowthRate *= 100;
    result.annualSafeWithdrawalRate *= 100;
    result.leanFiPercentage *= 100;
    result.roundAll();
    return result;
  }
}
