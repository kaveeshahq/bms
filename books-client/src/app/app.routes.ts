import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login').then(m => m.Login)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/components/layout/layout').then(m => m.Layout),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard/dashboard').then(m => m.Dashboard)
      },
      {
        path: 'books',
        loadComponent: () =>
          import('./features/books/book-list/book-list').then(m => m.BookList)
      },
      {
        path: 'books/new',
        loadComponent: () =>
          import('./features/books/book-form/book-form').then(m => m.BookForm)
      },
      {
        path: 'books/edit/:id',
        loadComponent: () =>
          import('./features/books/book-form/book-form').then(m => m.BookForm)
      },
      {
        path: 'books/:id',
        loadComponent: () =>
          import('./features/books/book-detail/book-detail').then(m => m.BookDetail)
      },
      {
        path: 'members',
        loadComponent: () =>
          import('./features/members/member-list/member-list').then(m => m.MemberList)
      },
      {
        path: 'members/new',
        loadComponent: () =>
          import('./features/members/member-form/member-form').then(m => m.MemberForm)
      },
      {
        path: 'members/edit/:id',
        loadComponent: () =>
          import('./features/members/member-form/member-form').then(m => m.MemberForm)
      },
      {
        path: 'members/:id',
        loadComponent: () =>
          import('./features/members/member-profile/member-profile').then(m => m.MemberProfile)
      },
      {
        path: 'borrowings',
        loadComponent: () =>
          import('./features/borrowings/borrowing-list/borrowing-list').then(m => m.BorrowingList)
      },
      {
        path: 'borrowings/issue',
        loadComponent: () =>
          import('./features/borrowings/issue-book/issue-book').then(m => m.IssueBook)
      },
      {
        path: 'fines',
        loadComponent: () =>
          import('./features/fines/fine-list/fine-list').then(m => m.FineList)
      }
    ]
  }
];