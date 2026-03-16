import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { MemberService } from '../../../core/services/member.service';
import { Member } from '../../../models/member.model';

@Component({
  selector: 'app-member-profile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './member-profile.html',
  styleUrl: './member-profile.css'
})
export class MemberProfile implements OnInit {
  member: Member | null = null;
  totalBorrowed = 0;
  currentlyBorrowed = 0;
  overdue = 0;
  pendingFines = 0;

  constructor(
    private memberService: MemberService,
    private route: ActivatedRoute,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.params['id']);

    // Load member details
    this.memberService.getById(id).subscribe({
      next: (data) => {
        this.member = data;
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Error loading member', err)
    });

    // Load member stats
    this.http.get<any>(`http://localhost:5164/api/members/${id}/stats`)
      .subscribe({
        next: (stats) => {
          this.totalBorrowed = stats.totalBorrowed;
          this.currentlyBorrowed = stats.currentlyBorrowed;
          this.overdue = stats.overdue;
          this.pendingFines = stats.pendingFines;
          this.cdr.markForCheck();
        },
        error: (err) => console.error('Error loading stats', err)
      });
  }
}