import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkDone, pricetags } from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel
  ]
})
export class TabsPage implements OnInit {

  constructor() {
    addIcons({
      'checkmark-done': checkmarkDone,
      'pricetags': pricetags
    });
  }

  public ngOnInit() {
  }

}