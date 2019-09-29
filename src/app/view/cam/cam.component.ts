import { AuthService } from 'src/app/service/auth.service';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { MessagingService } from './../../service/messaging.service';

enum MessageType {
  videoOffer = 'video-offer',
  videoAnswer = 'video-answer',
  newIceCandidate = 'new-ice-candidate',
  hangup = 'hangup'
}

interface ExchangeMessage {
  type: MessageType;
  name: string; // The sender's username.
  target: string;
  sdp?: RTCSessionDescriptionInit;
  candidate?: string;
}

interface Signaling extends ExchangeMessage {
  type: MessageType.videoOffer | MessageType.videoAnswer;
  target: string; // The username of the person to receive the description (if the caller is sending the message,
                  // this specifies the callee, and vice-versa)
  sdp: RTCSessionDescriptionInit;
}

interface IceCandidate extends ExchangeMessage {
  type: MessageType.newIceCandidate;
  target: string; // The username of the person with whom negotiation is underway;
                  // the server will direct the message to this user only.
  candidate: string; // The SDP candidate string, describing the proposed connection method.
                     // You typically don't need to look at the contents of this string.
                     // All your code needs to do is route it through to the remote peer using the signaling server.
}

interface NamedPeerConnection {

  name: string;
  pc: RTCPeerConnection;
  localStream?: MediaStream;
}

@Component({
  selector: 'app-cam',
  templateUrl: './cam.component.html',
  styleUrls: ['./cam.component.css']
})
export class CamComponent implements OnInit, OnDestroy {

  // @ViewChild('localVideo') me: ElementRef;
  @ViewChild('remoteVideo') remote: ElementRef;

  private readonly iceServers = [
    // { urls: 'stun:stun.services.mozilla.com' },
    // { urls: 'stun:stun.l.google.com:19302' }
  ];

  private subscriptions: Subscription[] = [];
  private userName: string;
  // private remoteName: string;
  // private localStream: MediaStream;

  private remotePeers: NamedPeerConnection[] = [];

  errors: string[] = [];
  callActive = false;

  private readonly camUser = 'admin';

  constructor(private authService: AuthService, private messagingService: MessagingService
    // private route: ActivatedRoute,
    ) {
    // this.route.queryParamMap.subscribe(params => {
    //   if (params.get('user') === UserType.answerer) {
    //     this.userType = UserType.answerer;
    //   } else {
    //     this.userType = UserType.caller;
    //   }
    // });
  }

  ngOnInit() {
    this.authService.checkCredentials();
    this.userName = this.authService.user.user_name;
    this.setupMessagesHandling();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.hangupCall(this.camUser);
  }

  private setupMessagesHandling() {
    this.messagingService.onReceiveMessage(message => {
      const parsed: ExchangeMessage = JSON.parse(message.body);
      if (parsed.target === this.userName) {
        const remoteUserName = parsed.name;
        this.setupWebRtc(remoteUserName);
        switch (parsed.type) {
          case MessageType.newIceCandidate:
            this.getRemotePC(remoteUserName).pc.addIceCandidate(new RTCIceCandidate(JSON.parse(parsed.candidate)));
            break;
          case MessageType.videoOffer:
            this.getRemotePC(remoteUserName).pc.setRemoteDescription(new RTCSessionDescription(parsed.sdp))
              .then(() => this.answerCall(remoteUserName));
            break;
          case MessageType.videoAnswer:
            this.getRemotePC(remoteUserName).pc.setRemoteDescription(new RTCSessionDescription(parsed.sdp));
            break;
          case MessageType.hangup:
            this.hangupCall(this.camUser);
            break;
        }
      }
    });
  }

  private sendMessage(message: ExchangeMessage) {
    this.messagingService.sendMessage(JSON.stringify(message));
  }

  private createIceCandidate(remoteName: string, event: RTCPeerConnectionIceEvent): IceCandidate {
    return {
      type: MessageType.newIceCandidate,
      name: this.userName,
      target: remoteName,
      candidate: JSON.stringify(event.candidate)
    };
  }

  private createSignaling(
    remoteName: string,
    type: MessageType.videoOffer | MessageType.videoAnswer,
    localDescription: RTCSessionDescription): Signaling {
    return {
      type: type,
      name: this.userName,
      target: remoteName,
      sdp: localDescription
    };
  }

  private getRemotePC(remoteUserName: string): NamedPeerConnection {
    return this.remotePeers.find(peer => peer.name === remoteUserName);
  }

  private setupWebRtc(remoteUserName: string) {
    if (this.getRemotePC(remoteUserName) && this.getRemotePC(remoteUserName).pc) {
      return;
    }

    this.initPeerConnection(remoteUserName);
    const pc = this.getRemotePC(remoteUserName).pc;

    if (!pc) {
      this.handleError(`setupWebRtc on error, pc[${remoteUserName}] null`);
      return;
    }

    if (!pc.onicecandidate) {
      pc.onicecandidate = event => {
        if (event.candidate) {
          this.sendMessage(this.createIceCandidate(remoteUserName, event));
        }
      };
    }

    if (!pc.ontrack) {
      pc.ontrack = event => {
        // receiving remote media stream
        (this.remote.nativeElement.srcObject = event.streams[0]);
      };
    }
  }

  private initPeerConnection(remoteUserName: string, retryOnce: boolean = true) {
    try {
      if (!this.getRemotePC(remoteUserName)) {
        this.remotePeers.push(
          {
            name: remoteUserName,
            pc: new RTCPeerConnection({iceServers: this.iceServers})
          });
      }
    } catch (error) {
      this.handleError(`initPeeConnection(${remoteUserName}, $${retryOnce}) on error`, error);
      if (retryOnce) {
        this.initPeerConnection(remoteUserName, false);
      }
    }
  }

  private handleCall(
    remoteUserName: string,
    messageType: MessageType.videoOffer | MessageType.videoAnswer
    ) {
    this.setupWebRtc(remoteUserName);
    const pc = this.getRemotePC(remoteUserName).pc;

    const createOfferOrAnswerCallback: (options?: RTCOfferOptions) => Promise<RTCSessionDescriptionInit> =
    messageType === MessageType.videoOffer ?
    () => pc.createOffer() : () => pc.createAnswer();

    navigator.mediaDevices.getUserMedia(
      {video: true , audio: true})
      .then(
      stream => {
        // this.me.nativeElement.srcObject = stream;
        this.getRemotePC(remoteUserName).localStream = stream;
        stream.getTracks().forEach(track => {
          pc.addTrack(track, stream);
        });

        createOfferOrAnswerCallback()
          .then(offer => {
            pc.setLocalDescription(offer)
            .then(() => {
              this.sendMessage(this.createSignaling(remoteUserName, messageType, pc.localDescription));
              this.callActive = true;
            })
            .catch(error => {
              this.handleError(`${messageType} pc[${remoteUserName}].setLocalDescription() error: `, error);
            });
          })
          .catch(error => {
            this.handleError(`${messageType} pc[${remoteUserName}].createOffer() error: `, error);
          });
      })
      .catch(
      error => {
        this.handleError(`${messageType} pc[${remoteUserName}].getUserMedia() error: `, error);
      }
      );
  }

  startCall(remoteUserName: string) {
    this.messagingService.sendMessage('Test ' + new Date());
    // this.handleCall(remoteUserName, MessageType.videoOffer);
  }

  answerCall(remoteUserName: string) {
    this.handleCall(remoteUserName, MessageType.videoAnswer);
  }

  hangupCall(remoteUserName: string) {
    const pc = this.getRemotePC(remoteUserName).pc;
    if (pc) {
      pc.close();
      if (this.getRemotePC(remoteUserName).localStream) {
        this.getRemotePC(remoteUserName).localStream.getTracks().forEach(track => track.stop());
        this.getRemotePC(remoteUserName).localStream = undefined;
      }
      const index = this.remotePeers.findIndex(peer => peer.name === remoteUserName);
      if (index > -1) {
        this.remotePeers.splice(index, 1);
      }
    }

    this.callActive = false;
  }

  callAction() {
    if (this.callActive) {
      this.hangupCall(this.camUser);
      this.sendMessage(
        {
          type: MessageType.hangup,
          name: this.userName,
          target: this.camUser
        }
      );
    } else {
      this.startCall(this.camUser);
    }
  }

  private handleError(message?: any, ...optionalParams: any[]): void {
    this.errors.push(message);
    console.error(message, optionalParams);
  }

}
