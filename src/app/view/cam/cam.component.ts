import { MessagingService } from './../../service/messaging.service';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

enum MessageType {
  videoOffer = 'video-offer',
  videoAnswer = 'video-answer',
  newIceCandidate = 'new-ice-candidate'
}

enum UserName {
  caller = 'caller',
  answerer = 'answerer'
}

interface ExchangeMessage {
  type: MessageType;
  name?: UserName;
  target: UserName;
  sdp?: string;
  candidate?: string;
}

interface Signaling extends ExchangeMessage {
  type: MessageType.videoOffer | MessageType.videoAnswer;
  name: UserName; // The sender's username.
  target: UserName; // The username of the person to receive the description (if the caller is sending the message,
                  // this specifies the callee, and vice-versa)
  sdp: string;
}

interface IceCandidate extends ExchangeMessage {
  type: MessageType.newIceCandidate;
  target: UserName; // The username of the person with whom negotiation is underway;
                  // the server will direct the message to this user only.
  candidate: string; // The SDP candidate string, describing the proposed connection method.
                     // You typically don't need to look at the contents of this string.
                     // All your code needs to do is route it through to the remote peer using the signaling server.
}

@Component({
  selector: 'app-cam',
  templateUrl: './cam.component.html',
  styleUrls: ['./cam.component.css']
})
export class CamComponent implements OnInit, OnDestroy {

  @ViewChild('localVideo') me: ElementRef;
  @ViewChild('remoteVideo') remote: ElementRef;

  private pc: RTCPeerConnection;
  private subscriptions: Subscription[] = [];
  private myName: UserName;
  private remoteName: UserName;
  private readonly iceServers = [
    { urls: 'stun:stun.services.mozilla.com' },
    { urls: 'stun:stun.l.google.com:19302' }
  ];

  errors: string[] = [];

  constructor(private http: HttpClient, private route: ActivatedRoute, private messagingService: MessagingService) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      if (params.get('user') === UserName.caller) {
        this.myName = UserName.caller;
        this.remoteName = UserName.answerer;
      } else {
        this.myName = UserName.answerer;
        this.remoteName = UserName.caller;
      }
    });

    this.setupWebRtc();

    
    

    // window['roomHash'] = '2864fd7d-f14f-4522-b4b8-aff4d299f9d1'; // Math.floor(Math.random() * 0xFFFFFF).toString(16); // '2864fd7d';

    // this.subscriptions.push(
    //   this.dynamicScriptLoader.scriptLoader
    //   .pipe(
    //     filter(script => script.loaded && !script.error && script.status === 'Loaded'),
    //     tap(script => {
    //       if (script.name === ScriptName.scaledrone) {
    //         this.dynamicScriptLoader.load(ScriptName.webrtc); // load script.js only when scaledrone script is loaded
    //       }
    //     })
    //     )
    //   .subscribe(
    //     script => {
    //         console.log(window['roomHash'], script);
    //     }
    //   )
    // );
    // this.subscriptions.push(
    //   this.dynamicScriptLoader.scriptLoader
    //   .pipe(filter(script => script.loaded && script.error))
    //   .subscribe(
    //     script => {
    //         this.handleError(script);
    //     }
    //   )
    // );
    // // this.dynamicScriptLoader.load(ScriptName.scaledrone);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private sendMessage(message: ExchangeMessage) {
    this.messagingService.sendMessage(JSON.stringify(message));
  }

  private createIceCandidate(event: RTCPeerConnectionIceEvent): IceCandidate {
    return {
      type: MessageType.newIceCandidate,
      target: this.remoteName,
      candidate: JSON.stringify(event.candidate)
    };
  }

  private createSignaling(type: MessageType.videoOffer | MessageType.videoAnswer, localDescription: RTCSessionDescription): Signaling {
    return {
      type: type,
      name: this.myName,
      target: this.remoteName,
      sdp: JSON.stringify(localDescription)
    };
  }

  setupWebRtc() {
    this.initPeerConnection();
    if (!this.pc) {
      this.handleError('setupWebRtc on error, pc null');
      return;
    }
    this.pc.onicecandidate = event => {
      if (event.candidate) {
        this.sendMessage(this.createIceCandidate(event));
      } else {
        console.log('Sent All Ice Candidates');
      }
    };
    this.messagingService.onReceiveMessage(
      message => {
        const parsed: ExchangeMessage = JSON.parse(message.body);
        console.warn(parsed);
        if (parsed.target === this.myName) {
          switch (parsed.type) {
            case MessageType.newIceCandidate :
                this.pc.addIceCandidate(new RTCIceCandidate(JSON.parse(parsed.candidate)));
              break;
            case MessageType.videoOffer :
                // this.callActive = true;
                this.pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(parsed.sdp)))
                .then(() => this.pc.createAnswer())
                .then(answer => this.pc.setLocalDescription(answer))
                .then(() => this.sendMessage(this.createSignaling(MessageType.videoAnswer, this.pc.localDescription)));
              break;
            case MessageType.videoAnswer :
                // this.callActive = true;
                this.pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(parsed.sdp)));
              break;
          }
        }
      }
    );
  }



  initPeerConnection(retryOnce: boolean = true) {
    try {
      if (!this.pc) {
        this.pc = new RTCPeerConnection({
          iceServers: this.iceServers
        });
      }
    } catch (error) {
      this.handleError('initPeeConnection() on error', error, retryOnce);
      if (retryOnce) {
        this.initPeerConnection(false);
      }
    }
  }

  startCall() {

    navigator.mediaDevices.getUserMedia(
      {video: true , audio: true})
      .then(
      stream => {
        this.me.nativeElement.srcObject = stream;
        stream.getTracks().forEach(track => {
          this.pc.addTrack(track, stream);
        });

        this.pc.createOffer()
          .then(offer => {
            this.pc.setLocalDescription(offer)
            .then(() => {
              this.sendMessage(this.createSignaling(MessageType.videoAnswer, this.pc.localDescription));
            })
            .catch(error => {
              this.handleError('this.pc.setLocalDescription() error: ', error);
            });
          })
          .catch(error => {
            this.handleError('this.pc.createOffer() error: ', error);
          });
      })
      .catch(
      error => {
        this.handleError('navigator.getUserMedia error: ', error);
      }
      );
  }

  // answerCall() {
  //   navigator.getUserMedia(
  //     {video: true , audio: true},
  //     stream => {
  //       this.me.nativeElement.srcObject = stream;
  //       stream.getTracks().forEach(track => {
  //         this.pc.addTrack(track, stream);
  //       });

  //       this.pc.createAnswer()
  //         .then(answer => {
  //           this.pc.setLocalDescription(answer)
  //           .then(() => {
  //             this.sendMessage(this.createSignaling(MessageType.videoAnswer, this.pc.localDescription));
  //           })
  //           .catch(error => {
  //             this.handleError('this.pc.setLocalDescription() error: ', error);
  //           });
  //         })
  //         .catch(error => {
  //           this.handleError('this.pc.createOffer() error: ', error);
  //         });
  //     },
  //     error => {
  //       this.handleError('navigator.getUserMedia error: ', error);
  //     }
  //     );
  // }

  showRemote() {
    // try {
    //   this.pc.createOffer()
    //     .then(offer => this.pc.setLocalDescription(offer))
    //     .then(() => {
    //       this.sendMessage(this.senderId, JSON.stringify({ sdp: this.pc.localDescription }));
    //       this.callActive = true;
    //     });
    // } catch (error) {
    //   this.setupWebRtc();
    //   console.log(error);
    // }
  }

  startCam() {
    this.startCall();
  }

  private handleError(message?: any, ...optionalParams: any[]): void {
    this.errors.push(message);
    console.error(message, optionalParams);
  }

}
