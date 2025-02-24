import { Component } from '@angular/core';
import emailjs from 'emailjs-com';

@Component({
  selector: 'app-contact-us',
  imports: [],
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.scss',
})
export class ContactUsComponent {
  messageSent = false;
  messageError = false;

  sendEmail(event: Event) {
    event.preventDefault(); // Prevent page reload

    emailjs
      .sendForm(
        'service_xxxxxx', // 🔹 Replace with your EmailJS Service ID
        'template_xxxxxx', // 🔹 Replace with your EmailJS Template ID
        event.target as HTMLFormElement,
        'public_xxxxxx' // 🔹 Replace with your EmailJS Public Key
      )
      .then(() => {
        this.messageSent = true;
        this.messageError = false;
      })
      .catch(() => {
        this.messageError = true;
        this.messageSent = false;
      });
  }
}
