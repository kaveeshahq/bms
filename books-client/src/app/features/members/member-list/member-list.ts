import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MemberService } from '../../../core/services/member.service';
import { Member } from '../../../models/member.model';

@Component({
  selector: 'app-member-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatTooltipModule
  ],
  templateUrl: './member-list.html',
  styleUrl: './member-list.css'
})
export class MemberList implements OnInit {
  members: Member[] = [];
  searchTerm = '';
displayedColumns = ['memberId', 'fullName', 'phone', 'registeredAt', 'isActive', 'actions'];
  constructor(
    private memberService: MemberService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadMembers();
  }

  loadMembers() {
    this.memberService.getAll(this.searchTerm).subscribe({
      next: (data) => {
        this.members = data;
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Error loading members', err)
    });
  }

  onSearch() {
    this.loadMembers();
  }

  deleteMember(id: number) {
    if (confirm('Are you sure you want to delete this member?')) {
      this.memberService.delete(id).subscribe({
        next: () => this.loadMembers(),
        error: (err) => console.error('Error deleting member', err)
      });
    }
  }
}