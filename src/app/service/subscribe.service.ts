import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { UserDto } from '../model/user/user-dto';

@Injectable({
  providedIn: 'root'
})
export class SubscribeService {

  subscribedUser: Subject<{subscriber: UserDto, user: UserDto}> = new Subject();
  $subscribedUserObs: Observable<{subscriber: UserDto, user: UserDto}> = this.subscribedUser.asObservable();
  constructor() { }
}
