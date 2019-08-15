import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { UserDto } from '../model/user/user-dto';

export enum UserManagementAction {
  DELETE_USER = 'DELETE_USER',
  DELETE_SUBSCRIPTION = 'DELETE_SUBSCRIPTION',
}

@Injectable({
  providedIn: 'root'
})
export class SubscribeService {

  subscribedUser: Subject<{subscriber: UserDto, user: UserDto, action?: UserManagementAction}> = new Subject();
  $subscribedUserObs: Observable<{subscriber: UserDto, user: UserDto, action?: UserManagementAction}> = this.subscribedUser.asObservable();
  constructor() { }
}
