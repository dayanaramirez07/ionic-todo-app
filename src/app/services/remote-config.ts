import { Injectable, inject } from '@angular/core';
import { RemoteConfig } from '@angular/fire/remote-config';
import { fetchAndActivate, getValue } from '@angular/fire/remote-config';

@Injectable({
  providedIn: 'root',
})
export class RemoteConfigService {

  private initialized: boolean = false;

  private readonly remoteConfig: RemoteConfig = inject(RemoteConfig);

  constructor() {
    this.remoteConfig.settings.minimumFetchIntervalMillis = 3600000;
    this.remoteConfig.defaultConfig = {
      show_completed_tasks: false
    };
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await fetchAndActivate(this.remoteConfig);
    } catch (e) {
      console.error('RemoteConfig error', e);
    } finally {
      this.initialized = true;
    }
  }

  public getBoolean(key: string): boolean {
    return getValue(this.remoteConfig, key).asBoolean();
  }

}