import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin-service/admin-service';
import { User, UpdateUserRequest } from '../../models/user.interface';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Navbar } from '../../components/navbar/navbar';

@Component({
  selector: 'app-users-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastModule, Navbar],
  providers: [MessageService],
  templateUrl: './users-management.html',
  styleUrl: './users-management.css',
})
export class UsersManagementComponent implements OnInit {
  private adminService = inject(AdminService);
  private messageService = inject(MessageService);

  users = signal<User[]>([]);
  loading = signal<boolean>(false);
  editingUser = signal<User | null>(null);
  editForm = signal<UpdateUserRequest>({});

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los usuarios',
        });
        this.loading.set(false);
      },
    });
  }

  startEdit(user: User): void {
    this.editingUser.set(user);
    this.editForm.set({
      username: user.username,
      email: user.email,
      role: user.role || 'user',
    });
  }

  cancelEdit(): void {
    this.editingUser.set(null);
    this.editForm.set({});
  }

  saveUser(): void {
    const user = this.editingUser();
    if (!user) return;

    this.loading.set(true);
    this.adminService.updateUser(user._id, this.editForm()).subscribe({
      next: (updatedUser) => {
        const updatedUsers = this.users().map((u) =>
          u._id === updatedUser._id ? updatedUser : u
        );
        this.users.set(updatedUsers);
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Usuario actualizado correctamente',
        });
        this.cancelEdit();
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error updating user:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo actualizar el usuario',
        });
        this.loading.set(false);
      },
    });
  }

  deleteUser(userId: string): void {
    if (!confirm('¿Está seguro de eliminar este usuario?')) return;

    this.loading.set(true);
    this.adminService.deleteUser(userId).subscribe({
      next: () => {
        this.users.set(this.users().filter((u) => u._id !== userId));
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Usuario eliminado correctamente',
        });
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error deleting user:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo eliminar el usuario',
        });
        this.loading.set(false);
      },
    });
  }
}
