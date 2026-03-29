import { Injectable } from '@angular/core';
import { Category, Task } from '../models/task.model';

@Injectable({
  providedIn: 'root',
})
export class StorageService {

  private TASKS_KEY: string = 'tasks';
  private CATEGORIES_KEY: string = 'categories';

  public getTasks(): Task[] {
    const data = localStorage.getItem(this.TASKS_KEY);
    return data ? JSON.parse(data) : [];
  }

  public saveTasks(tasks: Task[]): void {
    localStorage.setItem(this.TASKS_KEY, JSON.stringify(tasks));
  }

  public getCategories(): Category[] {
    const data = localStorage.getItem(this.CATEGORIES_KEY);
    return data ? JSON.parse(data) : [];
  }

  public saveCategories(categories: Category[]): void {
    localStorage.setItem(this.CATEGORIES_KEY, JSON.stringify(categories));
  }

}