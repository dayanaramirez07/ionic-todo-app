import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonList,
  IonItem, IonLabel, IonButton, IonButtons, IonIcon,
  AlertController
} from '@ionic/angular/standalone';
import { Category, Task } from 'src/app/models/task.model';
import { StorageService } from 'src/app/services/storage';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonList,
    IonItem, IonLabel, IonButton, IonButtons, IonIcon
  ]
})
export class CategoriesPage implements OnInit {

  protected categories: Category[] = [];

  protected readonly colors = [
    '#ef5350', '#42a5f5', '#66bb6a',
    '#ffa726', '#ab47bc', '#26c6da'
  ];

  constructor(
    private readonly storage: StorageService,
    private readonly alertCtrl: AlertController
  ) { }

  public ngOnInit() {
    this.categories = this.storage.getCategories();
  }

  private normalize(value: string): string {
    return value.toLowerCase();
  }

  private categoryExists(name: string, excludeId?: string): boolean {
    const normalized = this.normalize(name);

    return this.categories.some(c =>
      c.id !== excludeId &&
      this.normalize(c.name) === normalized
    );
  }

  private getTasks(): Task[] {
    return this.storage.getTasks();
  }

  private saveTasks(tasks: Task[]) {
    this.storage.saveTasks(tasks);
  }

  protected async openForm(category?: Category) {
    const alert = await this.alertCtrl.create({
      header: category
        ? 'Editar categoría'
        : this.categories.length
          ? 'Nueva categoría'
          : 'Nueva categoría (primera)',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Nombre',
          value: category?.name || ''
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: (data) => {
            const name = data?.name?.trim();
            if (!name) return false;

            if (this.categoryExists(name, category?.id)) {
              return false;
            }

            if (category) {
              this.categories = this.categories.map(c =>
                c.id === category.id ? { ...c, name } : c
              );
            } else {
              const newCategory: Category = {
                id: Date.now().toString(),
                name,
                color: this.colors[this.categories.length % this.colors.length]
              };

              this.categories = [...this.categories, newCategory];
            }

            this.storage.saveCategories(this.categories);
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  protected async deleteCategory(index: number) {
    const alert = await this.alertCtrl.create({
      header: '¿Eliminar categoría?',
      message: 'Las tareas de esta categoría quedarán sin categoría.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            const categoryToDelete = this.categories[index];
            if (!categoryToDelete) return;

            const updatedTasks = this.getTasks().map(task =>
              task.categoryId === categoryToDelete.id
                ? { ...task, categoryId: null }
                : task
            );

            this.saveTasks(updatedTasks);

            this.categories = this.categories.filter(
              c => c.id !== categoryToDelete.id
            );

            this.storage.saveCategories(this.categories);
          }
        }
      ]
    });

    await alert.present();
  }

}