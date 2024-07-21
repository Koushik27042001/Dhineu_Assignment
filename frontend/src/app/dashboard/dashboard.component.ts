// Import necessary Angular and third-party modules
import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { HttpClientModule, HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { DashboardEntryComponent } from '../dashboard-entry/dashboard-entry.component';
import { PaginationChangedEvent } from 'ag-grid-community';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

// Component decorator
@Component({
  selector: 'app-dashboard',               // The name of the component selector
  standalone: true,                       // Indicates that this is a standalone component
  imports: [                              // Imports used in this component
    CommonModule,
    FormsModule,
    AgGridModule,
    MatButtonModule,
    HttpClientModule,
    MatDialogModule
  ],
  templateUrl: './dashboard.component.html', // Path to the component's HTML template
  styleUrls: ['./dashboard.component.scss']  // Path to the component's CSS stylesheet
})
export class DashboardComponent implements OnInit {
  searchValue: string = '';               // Holds the value for search input
  rowData: any[] = [];                   // Array to hold the user data fetched from the server
  columnDefs = [                         // Column definitions for the ag-Grid
    { headerName: 'SL No', field: 'slno' },
    { headerName: 'User Name', field: 'username' },
    { headerName: 'Full Name', field: 'fullname' },
    { headerName: 'Mobile No', field: 'mobileno' },
    { headerName: 'Action', field: 'action', cellRenderer: this.actionCellRenderer.bind(this) } // Custom cell renderer for actions
  ];
  defaultColDef = {                     // Default column properties for the ag-Grid
    resizable: true,
    sortable: true,
    filter: true,
    flex: 1,
    minWidth: 100
  };
  paginationPageSize = 10;              // Number of rows per page for pagination
  currentPage = 1;                      // Current page index for pagination

  constructor(
    private http: HttpClient,            // HTTP client for making API requests
    public dialog: MatDialog,            // Dialog service for opening modals
    private cdr: ChangeDetectorRef,      // Change detection service
    private router: Router,              // Router service for navigation
    private snackBar: MatSnackBar        // Snackbar service for displaying messages
  ) { }

  ngOnInit() {
    this.loadUsers();                   // Load users when the component initializes
  }

  // Method to get authorization headers with the stored token
  private getAuthHeaders() {
    const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
    return new HttpHeaders().set('Authorization', token ? `Bearer ${token}` : '');
  }

  // Method to handle HTTP errors
  private handleError(error: any) {
    console.error('Error:', error);     // Log error to the console
    if (error.status === 500 && error.error.message === 'Failed to authenticate token') {
      this.snackBar.open('Authentication error. Please log in again.', 'Close', {
        duration: 3000,
        panelClass: ['snack-bar-error'] // Custom class for error messages
      });
      this.router.navigateByUrl('/login'); // Redirect to login page
    }
  }

  // Method to load users from the server
  loadUsers() {
    const headers = this.getAuthHeaders(); // Get authorization headers

    const params = new HttpParams()        // Set query parameters for pagination
      .set('page', (this.currentPage - 1).toString())
      .set('pageSize', this.paginationPageSize.toString());

    this.http.get<any[]>('http://localhost:3000/users', { headers, params }).subscribe(
      data => {
        this.rowData = data.map((user, index) => ({
          ...user,
          slno: (this.currentPage - 1) * this.paginationPageSize + index + 1 // Calculate serial number
        }));
        this.cdr.detectChanges();          // Trigger change detection manually
      },
      error => this.handleError(error)    // Handle errors
    );
  }

  // Method to handle pagination changes
  onPageChanged(event: PaginationChangedEvent) {
    this.currentPage = event.api.paginationGetCurrentPage() + 1; // Update current page index
    // this.loadUsers(); // Reload data when pagination changes (currently commented out)
  }

  // Method to open dialog for adding a new user
  onAdd() {
    const dialogRef = this.dialog.open(DashboardEntryComponent, {
      width: '600px',
      data: { user: { username: '', fullname: '', mobileno: '', password: '' } }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers(); // Refresh user data after adding
        this.snackBar.open('User added successfully!', 'Close', {
          duration: 3000,
          panelClass: ['snack-bar-success'] // Custom class for success messages
        });
      }
    });
  }

  // Method to open dialog for editing a user
  onEdit(user: any) {
    const dialogRef = this.dialog.open(DashboardEntryComponent, {
      width: '400px',
      data: { user: { ...user } } // Pass user data to the dialog
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers(); // Refresh user data after editing
        this.snackBar.open('User updated successfully!', 'Close', {
          duration: 3000,
          panelClass: ['snack-bar-success'] // Custom class for success messages
        });
      }
    });
  }

  // Method to delete a user
  onDelete(userId: number) {
    const headers = this.getAuthHeaders(); // Get authorization headers

    this.http.delete(`http://localhost:3000/users/${userId}`, { headers }).subscribe(
      () => {
        this.loadUsers(); // Refresh user data after deleting
        this.snackBar.open('User deleted successfully!', 'Close', {
          duration: 3000,
          panelClass: ['snack-bar-success'] // Custom class for success messages
        });
      },
      error => {
        this.handleError(error); // Handle errors
        this.snackBar.open('Failed to delete user. Please try again.', 'Close', {
          duration: 3000,
          panelClass: ['snack-bar-error'] // Custom class for error messages
        });
      }
    );
  }

  // Custom cell renderer for action buttons
  actionCellRenderer(params: any) {
    const eGui = document.createElement('div'); // Create a new div element
    eGui.innerHTML = `
    <button class="btn btn-primary btn-sm edit-button p-2 rounded hover:bg-blue-600 focus:outline-none">
      <svg class="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h-1V6a1 1 0 00-1-1H8a1 1 0 00-1 1v1H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2zM8 7v1h4V7h-1v1a1 1 0 01-1 1H8a1 1 0 01-1-1V7zm1 2h2v2H9V9zm1 4a2 2 0 110-4 2 2 0 010 4z"/>
      </svg>
    </button>
    <button class="btn btn-danger btn-sm delete-button p-2 rounded hover:bg-red-600 focus:outline-none">
      <svg class="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 4h14M8 4V2a1 1 0 011-1h6a1 1 0 011 1v2m-7 4v8m0 0v2m-4-2h8m-4-8H6"/>
      </svg>
    </button>
  `;

    // Attach event listeners to the buttons
    eGui.querySelector('.edit-button')!.addEventListener('click', () => {
      this.onEdit(params.data); // Call onEdit with user data
    });

    eGui.querySelector('.delete-button')!.addEventListener('click', () => {
      this.onDelete(params.data.id); // Call onDelete with user ID
    });

    return eGui; // Return the div element with buttons
  }
}
