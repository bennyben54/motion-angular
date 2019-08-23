import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { MessagingService } from './../../service/messaging.service';

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
  sdp?: RTCSessionDescriptionInit;
  candidate?: string;
}

interface Signaling extends ExchangeMessage {
  type: MessageType.videoOffer | MessageType.videoAnswer;
  name: UserName; // The sender's username.
  target: UserName; // The username of the person to receive the description (if the caller is sending the message,
                  // this specifies the callee, and vice-versa)
  sdp: RTCSessionDescriptionInit;
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
  private localStream: MediaStream;
  private readonly iceServers = [
    { urls: 'stun:stun.services.mozilla.com' },
    { urls: 'stun:stun.l.google.com:19302' }
  ];

  errors: string[] = [];
  callActive = false;

  constructor(private route: ActivatedRoute, private messagingService: MessagingService) { }

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
      sdp: localDescription
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

    this.pc.ontrack = event => {
      // receiving remote media stream
      (this.remote.nativeElement.srcObject = event.streams[0]);
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
                this.pc.setRemoteDescription(new RTCSessionDescription(parsed.sdp))
                .then(() => this.answerCall());
                break;
            case MessageType.videoAnswer :
                this.pc.setRemoteDescription(new RTCSessionDescription(parsed.sdp));
                break;
              }
          }
        }
    );
  }

  private initPeerConnection(retryOnce: boolean = true) {
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

  private handleCall(
    messageType: MessageType.videoOffer | MessageType.videoAnswer,
    createOfferOrAnswerCallback: (options?: RTCOfferOptions) => Promise<RTCSessionDescriptionInit>
    ) {
    navigator.mediaDevices.getUserMedia(
      {video: true , audio: true})
      .then(
      stream => {
        this.me.nativeElement.srcObject = stream;
        this.localStream = stream;
        stream.getTracks().forEach(track => {
          this.pc.addTrack(track, stream);
        });

        createOfferOrAnswerCallback()
          .then(offer => {
            this.pc.setLocalDescription(offer)
            .then(() => {
              this.sendMessage(this.createSignaling(messageType, this.pc.localDescription));
              this.callActive = true;
            })
            .catch(error => {
              this.handleError(`${messageType} this.pc.setLocalDescription() error: `, error);
            });
          })
          .catch(error => {
            this.handleError(`${messageType} this.pc.createOffer() error: `, error);
          });
      })
      .catch(
      error => {
        this.handleError(`${messageType} this.pc.getUserMedia() error: `, error);
      }
      );
  }

  startCall() {
    this.handleCall(MessageType.videoOffer, () => this.pc.createOffer());
  }

  answerCall() {
    this.handleCall(MessageType.videoAnswer, () => this.pc.createAnswer());
  }

  hangup() {
    this.pc.close();
    this.localStream.getTracks().forEach(track => track.stop());
    this.callActive = false;
  }

  startCam() {
    this.startCall();
  }

  private handleError(message?: any, ...optionalParams: any[]): void {
    this.errors.push(message);
    console.error(message, optionalParams);
  }

}
