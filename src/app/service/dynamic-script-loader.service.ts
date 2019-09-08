import { Subject, Observable } from 'rxjs';
import { Injectable } from '@angular/core';

export enum ScriptName {
  scaledrone = 'scaledrone',
  webrtc = 'webrtc'
}

export interface Script {
  name: ScriptName;
  src: string;
  loaded: boolean;
  error: boolean;
  status: string;
}

declare var document: any;

@Injectable({
  providedIn: 'root'
})
export class DynamicScriptLoaderService {

  private scriptLoaderSubject: Subject<Script> = new Subject();
  scriptLoader: Observable<Script> = this.scriptLoaderSubject.asObservable();

  private scripts: Script[] = [
    { name: ScriptName.scaledrone, src: 'assets/js/scaledrone.min.js', loaded: false, error: false, status: 'NotLoaded' },
    { name: ScriptName.webrtc, src: 'assets/js/webrtc.js', loaded: false, error: false, status: 'NotLoaded' }
  ];

  constructor() {
  }

  load(...scripts: ScriptName[]) {
    scripts.forEach(script => this.loadScript(script));
  }


  loadScript(name: ScriptName) {
    const scriptByName = this.scripts.find(script => script.name === name);
      if (!scriptByName.loaded) {
        // load script
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = scriptByName.src;
        if (script.readyState) {  // IE
            script.onreadystatechange = () => {
                if (script.readyState === 'loaded' || script.readyState === 'complete') {
                    script.onreadystatechange = null;
                    scriptByName.loaded = true;
                    scriptByName.error = false;
                    scriptByName.status = 'Loaded';
                    this.scriptLoaderSubject.next(scriptByName);
                }
            };
        } else {  // Others
            script.onload = () => {
              scriptByName.loaded = true;
              scriptByName.error = false;
              scriptByName.status = 'Loaded';
              this.scriptLoaderSubject.next(scriptByName);
            };
        }
        script.onerror = (error: any) => {
          scriptByName.loaded = true;
          scriptByName.error = true;
          scriptByName.status = 'Loaded';
          this.scriptLoaderSubject.next(scriptByName);
        };
        document.getElementsByTagName('head')[0].appendChild(script);
      } else {
        scriptByName.status = 'AlreadyLoaded';
        this.scriptLoaderSubject.next(scriptByName);
      }
    }
  }
  
