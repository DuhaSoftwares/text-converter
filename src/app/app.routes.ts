import { Routes } from '@angular/router';
import { EditorComponent } from './components/main/editor/editor.component';

export const routes: Routes = [
  { path: '', redirectTo: 'editor', pathMatch: 'full' },
  { path: 'editor', component: EditorComponent },
];
