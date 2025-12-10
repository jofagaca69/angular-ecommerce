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
  phoneError = signal<string | null>(null);

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
      name: user.name,
      phone: user.phone,
      address: user.address,
      role: user.role || 'user',
    });
    this.phoneError.set(null);
  }

  cancelEdit(): void {
    this.editingUser.set(null);
    this.editForm.set({});
    this.phoneError.set(null);
  }

  validatePhone(phone: string | undefined): boolean {
    if (!phone || phone === '') {
      this.phoneError.set(null);
      return true; // Phone is optional
    }
    const phoneRegex = /^[0-9]{8,15}$/;
    if (!phoneRegex.test(phone)) {
      this.phoneError.set('El teléfono debe tener entre 8 y 15 dígitos');
      return false;
    }
    this.phoneError.set(null);
    return true;
  }

  onPhoneChange(phone: string): void {
    const form = this.editForm();
    this.editForm.set({ ...form, phone });
    this.validatePhone(phone);
  }

  saveUser(): void {
    const user = this.editingUser();
    if (!user) return;

    // Validate phone number before submitting
    const form = this.editForm();
    if (!this.validatePhone(form.phone)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error de validación',
        detail: 'Por favor corrija el formato del teléfono',
      });
      return;
    }

    // Validate name length
    if (form.name && form.name.length > 100) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error de validación',
        detail: 'El nombre no puede exceder 100 caracteres',
      });
      return;
    }

    // Validate address length
    if (form.address && form.address.length > 500) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error de validación',
        detail: 'La dirección no puede exceder 500 caracteres',
      });
      return;
    }

    // Ensure at least one field is being updated
    const hasChanges = Object.keys(form).some(key => {
      const formValue = form[key as keyof UpdateUserRequest];
      const userValue = user[key as keyof User];
      return formValue !== undefined && formValue !== null && formValue !== userValue;
    });

    if (!hasChanges) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Sin cambios',
        detail: 'No se han realizado cambios',
      });
      return;
    }

    this.loading.set(true);
    this.adminService.updateUser(user._id, form).subscribe({
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
        const errorMessage = error.error?.message || 'No se pudo actualizar el usuario';
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage,
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
