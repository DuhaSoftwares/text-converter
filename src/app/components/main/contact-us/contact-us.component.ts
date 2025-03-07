import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import emailjs from 'emailjs-com';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-contact-us',
  imports: [CommonModule],
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.scss',
})
export class ContactUsComponent {
  messageSent = false;
  messageError = false;
  isLoading = false; // ✅ Add a loader flag

  sendEmail(event: Event) {
    event.preventDefault(); // Prevent page reload
    this.isLoading = true; // ✅ Show loader

    emailjs
      .sendForm(
        'service_o6k7cyp', // 🔹 Replace with your EmailJS Service ID
        'template_y59qf29', // 🔹 Replace with your EmailJS Template ID
        event.target as HTMLFormElement,
        '8eDkL0o60IX33p4m5' // 🔹 Replace with your EmailJS Public Key
      )
      .then(() => {
        this.messageSent = true;
        this.messageError = false;
    
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Your message has been sent successfully!",
          showConfirmButton: false,
          timer: 1500
        });
        (event.target as HTMLFormElement).reset(); // ✅ Clear the form
      })
      .catch(() => {
        this.messageError = true;
        this.messageSent = false;
        Swal.fire({
          position: "top-end",
          icon: "error",
          title: "Failed to send message. Please try again.",
          showConfirmButton: false,
          showCancelButton:true,
          cancelButtonText:'Ok',
        });
      })
      .finally(() => {
        this.isLoading = false; // ✅ Hide loader
      });
  }
}
