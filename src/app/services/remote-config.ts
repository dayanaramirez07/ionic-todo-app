import { Injectable } from '@angular/core';
import { RemoteConfig } from '@angular/fire/remote-config';
import { fetchAndActivate, getValue } from '@angular/fire/remote-config';

@Injectable({
  providedIn: 'root',
})
export class RemoteConfigService {

  private initialized: boolean = false;

  constructor(
    private readonly remoteConfig: RemoteConfig
  ) {
    this.remoteConfig.settings.minimumFetchIntervalMillis = 0;
    this.remoteConfig.defaultConfig = {
      show_completed_tasks: false
    };
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return;
    await fetchAndActivate(this.remoteConfig);
    this.initialized = true;
  }

  public getBoolean(key: string): boolean {
    return getValue(this.remoteConfig, key).asBoolean();
  }

}