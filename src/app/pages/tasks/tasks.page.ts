import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
  computed
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonIcon,
  AlertController, ToastController, IonSpinner, IonFab, IonFabButton
} from '@ionic/angular/standalone';

import { Task, Category } from 'src/app/models/task.model';
import { StorageService } from 'src/app/services/storage';
import { RemoteConfigService } from 'src/app/services/remote-config';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.page.html',
  styleUrls: ['./tasks.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle,
    IonContent, IonIcon, IonSpinner, IonFab, IonFabButton
  ]
})
export class TasksPage implements OnInit {

  private readonly storage = inject(StorageService);
  private readonly alertCtrl = inject(AlertController);
  private readonly toastCtrl = inject(ToastController);
  private readonly remoteConfig = inject(RemoteConfigService);

  protected tasks = this.storage.tasks;
  protected categories = this.storage.categories;

  protected selectedCategoryId = signal<string | null>(null);
  protected searchQuery = signal('');
  protected showCompletedTasks = signal(true);
  protected isConfigReady = signal(false);

  private categoryMap = computed(() =>
    new Map(this.categories().map(c => [c.id, c]))
  );

  protected visibleTasks = computed(() => {
    const normalizedSearch = this.normalize(this.searchQuery());

    return this.tasks().filter(task => {
      const matchesCategory =
        !this.selectedCategoryId() ||
        task.categoryId === this.selectedCategoryId();

      const matchesCompleted =
        this.showCompletedTasks() || !task.completed;

      const categoryName = this.normalize(this.getCategoryName(task.categoryId));

      const matchesSearch =
        !normalizedSearch ||
        this.normalize(task.title).includes(normalizedSearch) ||
        categoryName.includes(normalizedSearch);

      return matchesCategory && matchesCompleted && matchesSearch;
    });
  });

  protected todayTasks = computed(() =>
    this.visibleTasks().filter(t => !t.completed)
  );

  protected doneTasks = computed(() =>
    this.visibleTasks().filter(t => t.completed)
  );

  async ngOnInit() {
    try {
      await this.remoteConfig.initialize();

      this.showCompletedTasks.set(
        this.remoteConfig.getBoolean('show_completed_tasks') ?? false
      );
    } finally {
      this.isConfigReady.set(true);
    }
  }

  private normalize(value: string): string {
    return value.trim().toLowerCase();
  }

  private sortTasks(tasks: Task[]): Task[] {
    return [...tasks].sort((a, b) => b.createdAt - a.createdAt);
  }

  private taskExists(title: string): boolean {
    const normalized = this.normalize(title);
    return this.tasks().some(t => this.normalize(t.title) === normalized);
  }

  private findCategory(categoryId: string | null): Category | undefined {
    if (!categoryId) return undefined;
    return this.categoryMap().get(categoryId);
  }

  protected getCategoryName(categoryId: string | null): string {
    return this.findCategory(categoryId)?.name || 'Sin categoría';
  }

  protected getCategoryColor(categoryId: string | null): string {
    return this.findCategory(categoryId)?.color || '#ccc';
  }

  protected toggleComplete(task: Task) {
    const willComplete = !task.completed;

    const updated = this.tasks().map(t =>
      t.id === task.id
        ? { ...t, completed: willComplete }
        : t
    );

    this.storage.setTasks(this.sortTasks(updated));

    if (willComplete && !this.showCompletedTasks()) {
      void this.showValidationToast(
        'Tarea completada. Se oculto por configuracion remota.',
        'warning'
      );
    }
  }

  protected async addTask() {
    const alert = await this.alertCtrl.create({
      header: 'Nueva tarea',
      inputs: [
        { name: 'title', type: 'text', placeholder: 'Título de la tarea' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Siguiente',
          handler: (data) => {
            const title = data?.title?.trim();

            if (!title) {
              void this.showValidationToast('Ingresa un titulo de tarea.', 'warning');
              return false;
            }

            if (this.taskExists(title)) {
              void this.showValidationToast('Ya existe una tarea con ese titulo.', 'danger');
              return false;
            }

            this.openCategorySelector(title);
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  private async openCategorySelector(title: string) {
    const alert = await this.alertCtrl.create({
      header: 'Seleccionar categoría',
      inputs: [
        { name: 'category', type: 'radio', label: 'Sin categoría', value: null, checked: true },
        ...this.categories().map(cat => ({
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

            const updated = this.sortTasks([newTask, ...this.tasks()]);
            this.storage.setTasks(updated);

            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  protected async deleteTask(taskId: string) {
    const alert = await this.alertCtrl.create({
      header: '¿Eliminar tarea?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            const updated = this.tasks().filter(t => t.id !== taskId);
            this.storage.setTasks(this.sortTasks(updated));
          }
        }
      ]
    });

    await alert.present();
  }

  protected onCategoryChange(categoryId: string | null) {
    this.selectedCategoryId.set(categoryId);
  }

  protected onSearchChange(value: string) {
    this.searchQuery.set(value);
  }

  private async showValidationToast(message: string, color: 'warning' | 'danger') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2200,
      position: 'bottom',
      color
    });

    await toast.present();
  }

}