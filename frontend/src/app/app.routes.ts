import { CreateUserComponent } from './pages/create-user/create-user.component';
import { LoginComponent } from './pages/login/login.component';
import { DummyComponent } from './pages/dummy/dummy.component';
import { HomeComponent } from './pages/home/home.component';
import { ChatComponent } from './pages/home/components/chat/chat.component';
import { SettingsComponent } from './pages/home/components/settings/settings.component';
import { FindUsersComponent } from './pages/home/components/find-users/find-users.component';
import { FriendRequestsComponent } from './pages/home/components/friend-requests/friend-requests.component';
import { FriendsListComponent } from './pages/home/components/friends-list/friends-list.component';
import { redirectGuard } from './guards/redirect/redirect.guard';
import { authdGuard } from './guards/auth/auth-guard.guard';
import { Routes } from '@angular/router';
import { removeAuthGuard } from './guards/removeAuth/remove-auth.guard';

export const routes: Routes = [
  { path: '', component: DummyComponent, canActivate: [redirectGuard], pathMatch: 'full' },
  { path: 'create-user', title: 'Create User', component: CreateUserComponent, canActivate: [removeAuthGuard] },
  { path: 'login', title: 'Login', component: LoginComponent, canActivate: [removeAuthGuard] },
  { path: 'home', component: HomeComponent, canActivate: [authdGuard], canActivateChild: [authdGuard], children: [
    { path: '', redirectTo: 'settings', pathMatch: 'full' },
    { path: 'chat/:id', component: ChatComponent },
    { path: 'settings', title: 'Settings', component: SettingsComponent },
    { path: 'find-users', title: 'Find Users', component: FindUsersComponent },
    { path: 'friend-requests', title: 'Friend Requests', component: FriendRequestsComponent },
    { path: 'friends-list', title:  'Friends List', component: FriendsListComponent }
  ] },
  { path: '**', redirectTo: 'login', pathMatch: 'full' }
];
