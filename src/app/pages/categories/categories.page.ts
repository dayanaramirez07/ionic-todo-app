import {
  ChangeDetectionStrategy,
  Component,
  inject,
  computed
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonIcon,
  AlertController, ToastController, IonFab, IonFabButton
} from '@ionic/angular/standalone';

import { Category, Task } from 'src/app/models/task.model';
import { StorageService } from 'src/app/services/storage';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonIcon, IonFab, IonFabButton
  ]
})
export class CategoriesPage {

  private readonly storage = inject(StorageService);
  private readonly alertCtrl = inject(AlertController);
  private readonly toastCtrl = inject(ToastController);

  protected categories = this.storage.categories;
  protected tasks = this.storage.tasks;

  protected readonly colors = [
    '#ef5350', '#42a5f5', '#66bb6a',
    '#ffa726', '#ab47bc', '#26c6da'
  ];

  protected categoryTaskCount = computed(() => {
    const map = new Map<string, number>();

    this.tasks().forEach(task => {
      if (!task.categoryId) return;
      map.set(task.categoryId, (map.get(task.categoryId) || 0) + 1);
    });

    return map;
  });

  private normalize(value: string): string {
    return value.trim().toLowerCase();
  }

  private categoryExists(name: string, excludeId?: string): boolean {
    const normalized = this.normalize(name);

    return this.categories().some(c =>
      c.id !== excludeId &&
      this.normalize(c.name) === normalized
    );
  }

  protected getCategoryTaskCount(categoryId: string): number {
    return this.categoryTaskCount().get(categoryId) || 0;
  }

  protected async openForm(category?: Category) {
    const alert = await this.alertCtrl.create({
      header: category
        ? 'Editar categoría'
        : this.categories().length
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
            const isEditing = Boolean(category);

            if (!name) {
              void this.showValidationToast(
                isEditing
                  ? 'Ingresa un nombre valido para actualizar la categoria.'
                  : 'Ingresa un nombre de categoria.',
                'warning'
              );
              return false;
            }

            const isUnchangedName =
              isEditing &&
              this.normalize(name) === this.normalize(category!.name);

            if (isUnchangedName) {
              void this.showValidationToast('No hiciste cambios en la categoria.', 'warning');
              return false;
            }

            if (this.categoryExists(name, category?.id)) {
              void this.showValidationToast(
                isEditing
                  ? 'Ya existe otra categoria con ese nombre.'
                  : 'Ya existe una categoria con ese nombre.',
                'danger'
              );
              return false;
            }

            let updated: Category[];

            if (category) {
              updated = this.categories().map(c =>
                c.id === category.id ? { ...c, name } : c
              );
            } else {
              const newCategory: Category = {
                id: Date.now().toString(),
                name,
                color: this.colors[this.categories().length % this.colors.length]
              };

              updated = [...this.categories(), newCategory];
            }

            this.storage.setCategories(updated);
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
            const categoryToDelete = this.categories()[index];
            if (!categoryToDelete) return;

            const updatedTasks = this.tasks().map(task =>
              task.categoryId === categoryToDelete.id
                ? { ...task, categoryId: null }
                : task
            );

            this.storage.setTasks(updatedTasks);

            const updatedCategories = this.categories().filter(
              c => c.id !== categoryToDelete.id
            );

            this.storage.setCategories(updatedCategories);
          }
        }
      ]
    });

    await alert.present();
  }

  private async showValidationToast(
    message: string,
    color: 'warning' | 'danger'
  ): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2200,
      position: 'bottom',
      color
    });

    await toast.present();
  }

}