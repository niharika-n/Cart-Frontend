import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, CanActivateChild } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './authorization.service';
import { LoginUser } from './../shared/login-model';
import { UserRoles } from '../app.enum';
import { isNullOrUndefined } from 'util';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {
  key = '';
  user: LoginUser;
  currentRole: any = [];

  constructor(private auth: AuthService, private router: Router) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return this.getUserDetails(route, state);
  }

  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return this.getUserDetails(route, state);
  }

  getUserDetails(route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    this.user = JSON.parse(localStorage.getItem('user'));
    if (this.auth.isLoggednIn()) {
      const result = this.activateUser(route, state);
      if (result) {
        return true;
      } else {
        this.router.navigate(['']);
        return false;
      }
    }
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  activateUser(route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (!isNullOrUndefined(route.data.roles)) {
      const roles: any[] = route.data.roles;
      const currentUserRoleId = this.user.roles;
      this.currentRole = [];
      for (let role = 0; role < this.user.roles.length; role++) {
        this.currentRole.push(UserRoles[currentUserRoleId[role]]);
      }
      const result = this.verifyUser(roles, this.currentRole);
      if (result) {
        return true;
      } else {
        this.router.navigate(['']);
        return false;
      }
    }
    return false;
  }

  verifyUser(roles: any[], userRoles: any) {
    for (let i = 0; i < userRoles.length; i++) {
      if (roles.includes(userRoles[i].toLowerCase())) {
        return true;
      }
    }
    return false;
  }

}

