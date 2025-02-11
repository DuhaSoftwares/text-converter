import { CommonModule } from '@angular/common';
import {  Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TopNavComponent } from './components/internal/top-nav/top-nav.component';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [RouterModule, CommonModule, ReactiveFormsModule,TopNavComponent]
})
export class AppComponent implements OnInit {
  title = 'text-editor';
ngOnInit(): void {
    
}
}