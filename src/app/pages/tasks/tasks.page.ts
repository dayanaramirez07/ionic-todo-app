import { Component, NgZone, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonList,
  IonItem, IonLabel, IonButton, IonButtons, IonIcon,
  IonSelect, IonSelectOption, IonChip,
  AlertController, ViewWillEnter, IonSpinner
} from '@ionic/angular/standalone';

import { Task, Category } from 'src/app/models/task.model';
import { StorageService } from 'src/app/services/storage';
import { RemoteConfigService } from 'src/app/services/remote-config';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.page.html',
  styleUrls: ['./tasks.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonList,
    IonItem, IonLabel, IonButton, IonButtons, IonIcon,
    IonSelect, IonSelectOption, IonChip,
    IonSpinner
  ]
})
export class TasksPage implements OnInit, ViewWillEnter {

  protected tasks: Task[] = [];
  protected categories: Category[] = [];
  protected selectedCategoryId: string | null = null;
  protected showCompletedTasks: boolean = true;
  protected isConfigReady: boolean = false;
  protected visibleTasks: Task[] = [];

  constructor(
    private readonly zone: NgZone,
    private readonly storage: StorageService,
    private readonly alertCtrl: AlertController,
    private readonly remoteConfig: RemoteConfigService
  ) { }

  public async ngOnInit() {
    this.tasks = this.storage.getTasks();
    this.categories = this.storage.getCategories();

    await this.remoteConfig.initialize();
    this.showCompletedTasks = this.remoteConfig.getBoolean('show_completed_tasks');

    this.updateVisibleTasks();
    this.isConfigReady = true;
  }

  public ionViewWillEnter() {
    this.tasks = this.sortTasks(this.storage.getTasks());
    this.categories = this.storage.getCategories();

    this.updateVisibleTasks();
  }

  // Helpers
  private normalize(value: string): string {
    return value.toLowerCase();
  }

  private sortTasks(tasks: Task[]): Task[] {
    return [...tasks].sort((a, b) => b.createdAt - a.createdAt);
  }

  private taskExists(title: string): boolean {
    const normalized = this.normalize(title);
    return this.tasks.some(t => this.normalize(t.title) === normalized);
  }

  private findCategory(categoryId: string | null): Category | undefined {
    return this.categories.find(c => c.id === categoryId);
  }

  protected getCategoryName(categoryId: string | null): string {
    return this.findCategory(categoryId)?.name || 'Sin categoría';
  }

  protected getCategoryColor(categoryId: string | null): string {
    return this.findCategory(categoryId)?.color || '#ccc';
  }

  // Actions
  protected toggleComplete(task: Task) {
    this.tasks = this.sortTasks(
      this.tasks.map(t =>
        t.id === task.id
          ? { ...t, completed: !t.completed }
          : t
      )
    );

    this.storage.saveTasks(this.tasks);
    this.updateVisibleTasks();
  }

  protected async addTask() {
    const titleAlert = await this.alertCtrl.create({
      header: 'Nueva tarea',
      inputs: [
        {
          name: 'title',
          type: 'text',
          placeholder: 'Título de la tarea'
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Siguiente',
          handler: (data) => {
            const title = data?.title?.trim();
            if (!title) return false;
            if (this.taskExists(title)) return false;

            this.openCategorySelector(title);
            return true;
          }
        }
      ]
    });

    await titleAlert.present();
  }

  private async openCategorySelector(title: string) {
    const alert = await this.alertCtrl.create({
      header: 'Seleccionar categoría',
      inputs: [
        {
          name: 'category',
          type: 'radio',
          label: 'Sin categoría',
          value: null,
          checked: true
        },
        ...this.categories.map(cat => ({
          name: 'category',
          type: 'radio' as const,
          label: cat.name,
          value: cat.id
        }))
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: (categoryId) => {

            const newTask: Task = {
              id: Date.now().toString(),
              title,
              completed: false,
              categoryId: categoryId ?? null,
              createdAt: Date.now()
            };

            this.zone.run(() => {
              this.tasks = [newTask, ...this.tasks];
              this.storage.saveTasks(this.tasks);
              this.updateVisibleTasks();
            });

            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  protected async deleteTask(index: number) {
    const alert = await this.alertCtrl.create({
      header: '¿Eliminar tarea?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            const taskToDelete = this.visibleTasks[index];
            if (!taskToDelete) return;

            this.tasks = this.tasks.filter(t => t.id !== taskToDelete.id);
            this.storage.saveTasks(this.tasks);
            this.updateVisibleTasks();
          }
        }
      ]
    });

    await alert.present();
  }

  protected onCategoryChange() {
    this.updateVisibleTasks();
  }

  private updateVisibleTasks() {
    this.visibleTasks = this.tasks.filter(task => {
      const matchesCategory =
        !this.selectedCategoryId || task.categoryId === this.selectedCategoryId;

      const matchesCompleted =
        this.showCompletedTasks || !task.completed;

      return matchesCategory && matchesCompleted;
    });
  }

}