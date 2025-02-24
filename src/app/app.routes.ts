import { Routes } from '@angular/router';
import { EditorComponent } from './components/main/editor/editor.component';
import { AboutUsComponent } from './components/main/about-us/about-us.component';
import { BlogComponent } from './components/main/blog/blog.component';
import { ContactUsComponent } from './components/main/contact-us/contact-us.component';
import { HomeComponent } from './components/main/home/home.component';
import { TermsAndConditionsComponent } from './components/main/terms-and-conditions/terms-and-conditions.component';
import { PrivacyPolicyComponent } from './components/main/privacy-policy/privacy-policy.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'online-text-editor', component: EditorComponent },
  { path: 'about-us', component: AboutUsComponent },
  { path: 'blog', component: BlogComponent },
  { path: 'contact-us', component: ContactUsComponent },
  { path: 'terms-and-conditions', component: TermsAndConditionsComponent },
  {path:'privacy-policy',component:PrivacyPolicyComponent}
];
