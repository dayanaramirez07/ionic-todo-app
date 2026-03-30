import { Injectable, signal } from '@angular/core';
import { Category, Task } from '../models/task.model';

@Injectable({
  providedIn: 'root',
})
export class StorageService {

  private readonly TASKS_KEY = 'tasks';
  private readonly CATEGORIES_KEY = 'categories';

  private _tasks = signal<Task[]>(this.loadTasks());
  private _categories = signal<Category[]>(this.loadCategories());

  public readonly tasks = this._tasks.asReadonly();
  public readonly categories = this._categories.asReadonly();

  private loadTasks(): Task[] {
    const data = localStorage.getItem(this.TASKS_KEY);
    return data ? JSON.parse(data) : [];
  }

  private loadCategories(): Category[] {
    const data = localStorage.getItem(this.CATEGORIES_KEY);
    return data ? JSON.parse(data) : [];
  }

  public setTasks(tasks: Task[]): void {
    this._tasks.set(tasks);
    localStorage.setItem(this.TASKS_KEY, JSON.stringify(tasks));
  }

  public setCategories(categories: Category[]): void {
    this._categories.set(categories);
    localStorage.setItem(this.CATEGORIES_KEY, JSON.stringify(categories));
  }

}