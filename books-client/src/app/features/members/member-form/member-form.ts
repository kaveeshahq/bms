import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MemberService } from '../../../core/services/member.service';
import { CreateMemberDto } from '../../../models/member.model';

@Component({
  selector: 'app-member-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule
  ],
  templateUrl: './member-form.html',
  styleUrl: './member-form.css'
})
export class MemberForm implements OnInit {
  isEditing = false;
  memberId: number | null = null;
  errorMessage = '';
  isActive = true;

formData: CreateMemberDto = {
  memberId: '',
  fullName: '',
  email: '',
  phone: '',
  address: ''
};

  constructor(
    private memberService: MemberService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.memberId = this.route.snapshot.params['id']
      ? Number(this.route.snapshot.params['id'])
      : null;

    if (this.memberId) {
      this.isEditing = true;
      this.memberService.getById(this.memberId).subscribe({
    next: (member) => {
  this.formData = {
    memberId: member.memberId,
    fullName: member.fullName,
    email: member.email,
    phone: member.phone,
    address: member.address ?? ''
  };
  this.isActive = member.isActive;
},
        error: (err) => console.error('Error loading member', err)
      });
    }
  }

  onSubmit() {
    this.errorMessage = '';

    if (this.isEditing && this.memberId) {
      this.memberService.update(this.memberId, {
        ...this.formData,
        isActive: this.isActive
      }).subscribe({
        next: () => this.router.navigate(['/members']),
        error: () => this.errorMessage = 'Failed to update member.'
      });
    } else {
      this.memberService.create(this.formData).subscribe({
        next: () => this.router.navigate(['/members']),
        error: () => this.errorMessage = 'Failed to add member.'
      });
    }
  }
}