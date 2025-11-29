import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-numeric-keypad',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './numeric-keypad.html',
  styleUrls: ['./numeric-keypad.css']
})
export class NumericKeypad {
  numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  @Output() key = new EventEmitter<{ type: 'digit' | 'backspace' | 'done', value?: string }>();

  press(n: number) {
    this.key.emit({ type: 'digit', value: String(n) });
  }

  backspace() {
    this.key.emit({ type: 'backspace' });
  }

  done() {
    this.key.emit({ type: 'done' });
  }
}
