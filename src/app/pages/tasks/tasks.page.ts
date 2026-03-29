import { Component, NgZone, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonList,
  IonItem, IonLabel, IonButton, IonButtons, IonIcon,
  IonSelect, IonSelectOption, IonChip, AlertController
} from '@ionic/angular/standalone';
import { Task, Category } from 'src/app/models/task.model';
import { StorageService } from 'src/app/services/storage';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.page.html',
  styleUrls: ['./tasks.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonList,
    IonItem, IonLabel, IonButton, IonButtons, IonIcon,
    IonSelect, IonSelectOption, IonChip
  ]
})
export class TasksPage implements OnInit {

  protected tasks: Task[] = [];
  protected categories: Category[] = [];
  protected selectedCategoryId: string | null = null;

  constructor(
    private readonly storage: StorageService,
    private readonly alertCtrl: AlertController,
    private readonly zone: NgZone
  ) { }

  public ngOnInit() {
    this.tasks = this.sortTasks(this.storage.getTasks());
    this.categories = this.storage.getCategories();
  }

  private normalize(value: string): string {
    return value.toLowerCase();
  }

  private sortTasks(tasks: Task[]): Task[] {
    return [...tasks].sort((a, b) => b.createdAt - a.createdAt);
  }

  private taskExists(title: string): boolean {
    const normalized = this.normalize(title);

    return this.tasks.some(
      t => this.normalize(t.title) === normalized
    );
  }

  private findCategory(categoryId: string | null): Category | undefined {
    return this.categories.find(c => c.id === categoryId);
  }

  protected get filteredTasks(): Task[] {
    if (!this.selectedCategoryId) return this.tasks;

    return this.tasks.filter(
      t => t.categoryId === this.selectedCategoryId
    );
  }

  protected getCategoryName(categoryId: string | null): string {
    return this.findCategory(categoryId)?.name || 'Sin categoría';
  }

  protected getCategoryColor(categoryId: string | null): string {
    return this.findCategory(categoryId)?.color || '#ccc';
  }

  protected toggleComplete(task: Task) {
    this.tasks = this.sortTasks(
      this.tasks.map(t =>
        t.id === task.id
          ? { ...t, completed: !t.completed }
          : t
      )
    );

    this.storage.saveTasks(this.tasks);
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
            const taskToDelete = this.filteredTasks[index];
            if (!taskToDelete) return;

            this.tasks = this.tasks.filter(
              t => t.id !== taskToDelete.id
            );

            this.storage.saveTasks(this.tasks);
          }
        }
      ]
    });

    await alert.present();
  }

}