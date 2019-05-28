import { Component, OnInit, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserDto } from 'src/app/model/user/user-dto';
import { SubscribeService } from 'src/app/service/subscribe.service';

@Component({
  selector: 'app-subscribe-elem',
  templateUrl: './subscribe-elem.component.html',
  styleUrls: ['./subscribe-elem.component.css']
})
export class SubscribeElemComponent implements OnInit {

  @Input()
  subscriber: UserDto;
  loading = false;

  constructor(private http: HttpClient, private subscribeService: SubscribeService) { }

  ngOnInit() {
  }

  acceptSubscrition() {
    this.loading = true;
    this.http.put<UserDto>(`http://localhost:8080/api/user/${this.subscriber.id}`, null)
    .subscribe(
      data => {
        this.subscribeService.subscribedUser.next({subscriber: this.subscriber, user: data});
        this.loading = false;
      },
      err => {
        console.error('Error accepting subscrition', this.subscriber, err);
        this.loading = false;
      }
    );
  }
}
