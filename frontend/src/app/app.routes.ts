import { Routes } from '@angular/router';
import { CreateUserComponent } from './pages/create-user/create-user.component';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { ChatComponent } from './pages/home/components/chat/chat.component';
import { SettingsComponent } from './pages/home/components/settings/settings.component';
import { FindUsersComponent } from './pages/home/components/find-users/find-users.component';
import { FriendRequestsComponent } from './pages/home/components/friend-requests/friend-requests.component';

export const routes: Routes = [
  { path: '', redirectTo: 'create-user', pathMatch: 'full' },
  { path: 'create-user', component: CreateUserComponent },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent, children: [
    { path: '', redirectTo: 'settings', pathMatch: 'full' },
    { path: 'chat/:id', component: ChatComponent },
    { path: 'settings', component: SettingsComponent },
    { path: 'find-users', component: FindUsersComponent },
    { path: 'friend-requests', component: FriendRequestsComponent }
  ] },
  { path: '**', redirectTo: 'login' }
];
