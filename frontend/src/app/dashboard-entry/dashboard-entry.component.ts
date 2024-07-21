// Import necessary Angular and third-party modules
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClientModule, HttpClient, HttpHeaders } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

// Component decorator
@Component({
  selector: 'app-dashboard-entry',               // The name of the component selector
  standalone: true,                           // Indicates that this is a standalone component
  imports: [                                  // Imports used in this component
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatDialogModule,
    HttpClientModule
  ],
  templateUrl: './dashboard-entry.component.html', // Path to the component's HTML template
  styleUrls: ['./dashboard-entry.component.scss']  // Path to the component's CSS stylesheet
})
export class DashboardEntryComponent {
  user: any; // Holds the user data passed to the dialog

  // Constructor to initialize the component
  constructor(
    public dialogRef: MatDialogRef<DashboardEntryComponent>, // Reference to the dialog that opened this component
    @Inject(MAT_DIALOG_DATA) public data: any, // Inject the data passed to the dialog
    private http: HttpClient, // HTTP client for making API requests
    private snackBar: MatSnackBar // Snackbar service for displaying messages
  ) {
    // Initialize user data, or set default values if no data is passed
    this.user = data.user || { username: '', password: '', fullname: '', mobileno: '', active: false };
  }

  // Method to create HTTP headers with authorization token
  private getAuthHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
    return new HttpHeaders().set('Authorization', token ? `Bearer ${token}` : '');
  }

  // Method to handle saving the user data
  onSave() {
    // Prepare the payload to be sent in the request
    const payload = {
      username: this.user.username,
      password: this.user.password,
      fullname: this.user.fullname,
      mobileno: this.user.mobileno,
      active: this.user.active
    };

    const headers = this.getAuthHeaders(); // Get authorization headers

    // Check if user has an ID (i.e., if it’s an edit operation)
    if (this.user.id) {
      // Edit user
      this.http.put(`http://localhost:3000/users/${this.user.id}`, payload, { headers }).subscribe(
        () => {
          this.snackBar.open('User updated successfully!', 'Close', {
            duration: 3000, // Snackbar duration
          });
          this.dialogRef.close(payload); // Close the dialog and pass the updated user data
        },
        (error) => {
          this.snackBar.open('Failed to update user. Please try again.', 'Close', {
            duration: 3000, // Snackbar duration
          });
        }
      );
    } else {
      // Add user
      this.http.post('http://localhost:3000/users', payload, { headers }).subscribe(
        () => {
          this.snackBar.open('User added successfully!', 'Close', {
            duration: 3000, // Snackbar duration
          });
          this.dialogRef.close(payload); // Close the dialog and pass the new user data
        },
        (error) => {
          this.snackBar.open('Failed to add user. Please try again.', 'Close', {
            duration: 3000, // Snackbar duration
          });
        }
      );
    }
  }

  // Method to handle cancelling the dialog
  onCancel() {
    this.dialogRef.close(); // Close the dialog without passing any data
  }
}
