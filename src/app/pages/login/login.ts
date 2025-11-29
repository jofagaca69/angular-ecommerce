import { Component } from '@angular/core';
import {NumericKeypad} from '../../components/numeric-keypad/numeric-keypad';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [NumericKeypad],
  templateUrl: './login.html',
})
export class Login {

  phone = '';
  password = '';

  showKeypad = false;
  activeField: 'phone' | 'password' | null = null;

  PHONE_MAX = 10;
  PASS_MAX = 6;

  openKeypad(field: 'phone' | 'password') {
    this.activeField = field;
    this.showKeypad = true;
  }

  closeKeypad() {
    this.showKeypad = false;
    this.activeField = null;
  }

  onKey(event: { type: 'digit' | 'backspace' | 'done', value?: string }) {
    if (!this.activeField) return;

    let model = this.activeField === 'phone'
      ? this.phone
      : this.password;

    if (event.type === 'digit') {
      const limit = this.activeField === 'phone' ? this.PHONE_MAX : this.PASS_MAX;
      if (model.length < limit) {
        model += event.value!;
      }
    }

    if (event.type === 'backspace') {
      model = model.slice(0, -1);
    }

    if (event.type === 'done') {
      this.closeKeypad();
    }

    if (this.activeField === 'phone') this.phone = model;
    if (this.activeField === 'password') this.password = model;
  }
}
