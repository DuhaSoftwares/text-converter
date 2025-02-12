import { Routes } from '@angular/router';
import { EditorComponent } from './components/main/editor/editor.component';
import { AboutUsComponent } from './components/main/about-us/about-us.component';
import { BlogComponent } from './components/main/blog/blog.component';
import { ContactUsComponent } from './components/main/contact-us/contact-us.component';

export const routes: Routes = [
  { path: '', redirectTo: 'editor', pathMatch: 'full' },
    { path: 'editor', component: EditorComponent },
    { path: 'aboutus', component: AboutUsComponent },
    { path: 'blog', component: BlogComponent },
    {path:'contactus',component:ContactUsComponent}
];
