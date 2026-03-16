import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { FineService } from '../../../core/services/fine.service';
import { Fine } from '../../../models/fine.model';

@Component({
  selector: 'app-fine-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatCardModule
  ],
  templateUrl: './fine-list.html',
  styleUrl: './fine-list.css'
})
export class FineList implements OnInit {
  fines: Fine[] = [];
  displayedColumns = ['book', 'member', 'amount', 'status', 'paidAt', 'actions'];

  constructor(
    private fineService: FineService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadFines();
  }

  loadFines() {
    this.fineService.getAll().subscribe({
      next: (data) => {
        this.fines = data;
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Error loading fines', err)
    });
  }

  payFine(id: number) {
    if (confirm('Mark this fine as paid?')) {
      this.fineService.pay(id).subscribe({
        next: () => this.loadFines(),
        error: (err) => console.error('Error paying fine', err)
      });
    }
  }
}