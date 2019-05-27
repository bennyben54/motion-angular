import { Injectable } from '@angular/core';
import { LoadingId } from '../model/loading/loading-id.enum';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  private loadingMap: Map<LoadingId, BehaviorSubject<boolean>> = new Map();

  constructor() { }

  startLoading(loadingId: LoadingId): void {
    if (!this.loadingMap.has(loadingId)) {
      this.loadingMap.set(loadingId, new BehaviorSubject(true));
    } else {
      this.loadingMap.get(loadingId).next(true);
    }
  }

  stopLoading(loadingId: LoadingId): void {
    if (!this.loadingMap.has(loadingId)) {
      this.loadingMap.set(loadingId, new BehaviorSubject(false));
    } else {
      this.loadingMap.get(loadingId).next(false);
    }
  }

  getLoadingObservable(loadingId: LoadingId): Observable<boolean> {
    if (!this.loadingMap.has(loadingId)) {
      this.loadingMap.set(loadingId, new BehaviorSubject(false));
    }
    return this.loadingMap.get(loadingId).asObservable();
  }

}
