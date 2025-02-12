import { Component } from '@angular/core';
import { SharedModule } from '../../../shared.module';
import { Router } from '@angular/router';

@Component({
  selector: 'app-top-nav',
  imports: [SharedModule],
  templateUrl: './top-nav.component.html',
  styleUrl: './top-nav.component.scss'
})
export class TopNavComponent {
  constructor(private router: Router) { }
  
  contactUs() {
    this.router.navigate(['/contactus']);
  }
  blog() {
    this.router.navigate(['/blog']);
  }
  privacyPolicy() {
    this.router.navigate(['/privacy-policy']);
  }
  aboutus() {
    this.router.navigate(['/aboutus']);
  }
  editor() {
    this.router.navigate(['/editor']);
  }


}
