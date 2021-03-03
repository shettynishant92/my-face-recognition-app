import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router'; // CLI imports router
import { FaceMatcherComponent } from './face-matcher/face-matcher.component';

const routes: Routes = [
    // { path: 'face-matcher', component: FaceMatcherComponent },
    // { path: '', pathMatch: 'full', redirectTo: 'face-matcher' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})

export class AppRoutingModule { }