import { Subscription } from 'rxjs';
import { Injectable, OnDestroy } from '@angular/core';
import { RxStompService } from '@stomp/ng2-stompjs';
import { Message } from '@stomp/stompjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MessagingService implements OnDestroy {

  private onReceiveMessageSubscription: Subscription;

  constructor(private rxStompService: RxStompService) { }

  sendMessage(body: string) {
    // console.warn('sendMessage', body);
    this.rxStompService.publish({destination: environment.rabbitmq.topic, body: body});
  }

  onReceiveMessage(whatToDoWithMessage: (message: Message) => void) {
    if (this.onReceiveMessageSubscription) {
      this.onReceiveMessageSubscription.unsubscribe();
    }
    this.onReceiveMessageSubscription =  this.rxStompService.watch(environment.rabbitmq.topic).subscribe(
      message => {
        // console.warn('onReceiveMessage', message.body);
        whatToDoWithMessage(message);
      });
  }

  ngOnDestroy() {
    if (this.onReceiveMessageSubscription) {
      this.onReceiveMessageSubscription.unsubscribe();
    }
  }
}
