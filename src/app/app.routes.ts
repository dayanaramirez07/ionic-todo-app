import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/tabs/tabs.page').then(m => m.TabsPage),
    children: [
      {
        path: 'tasks',
        loadComponent: () =>
          import('./pages/tasks/tasks.page').then(m => m.TasksPage)
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./pages/categories/categories.page').then(m => m.CategoriesPage)
      },
      {
        path: '',
        redirectTo: 'tasks',
        pathMatch: 'full'
      }
    ]
  }
];
