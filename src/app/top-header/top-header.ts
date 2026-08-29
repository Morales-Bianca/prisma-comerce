import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-top-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './top-header.html',
  styleUrl: './top-header.css'
})
export class TopHeader {
  @Input() title: string = '';
  @Input() titleLines: string[] = [];
}
