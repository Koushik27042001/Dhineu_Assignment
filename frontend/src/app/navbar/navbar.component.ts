// Import necessary Angular and third-party modules
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';

// Component decorator
@Component({
  selector: 'app-navbar',               // The name of the component selector
  standalone: true,                   // Indicates that this is a standalone component
  imports: [                          // Imports used in this component
    CommonModule,
    MatButtonModule,
    MatDialogModule
  ],
  templateUrl: './navbar.component.html', // Path to the component's HTML template
  styleUrls: ['./navbar.component.scss']  // Path to the component's CSS stylesheet
})
export class NavbarComponent implements OnInit {
  activeUser: any;                      // Variable to hold the active user data
  showLogoutButton: boolean = false;   // Flag to determine if logout button should be shown
  username: string = '';               // Variable to hold the username
  activeTokenCount: number = 0;        // Variable to hold the count of active tokens

  // Constructor to initialize the component
  constructor(
    private router: Router,             // Router service to handle navigation
    private http: HttpClient,           // HTTP client for making API requests
    private snackBar: MatSnackBar,      // Snackbar service for displaying messages
    private cookieService: CookieService // Service for managing cookies
  ) { }

  // Lifecycle hook to initialize component logic
  ngOnInit() {
    this.checkUrlForDashboard();        // Check URL for dashboard and update UI accordingly
    this.fetchActiveTokenCount();       // Fetch token count on initialization
  }

  // Method to monitor route changes and check if the URL contains 'dashboard'
  checkUrlForDashboard() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd) // Filter navigation end events
    ).subscribe(() => {
      const currentUrl = this.router.url; // Get the current URL
      this.showLogoutButton = currentUrl.includes('dashboard'); // Show logout button if URL contains 'dashboard'

      // Trigger additional updates if needed
      if (this.showLogoutButton) {
        this.reloadNavbar(); // Reload navbar if on the dashboard
      }
    });
  }

  // Method to reload navbar related data
  reloadNavbar() {
    this.loadUsername(); // Reload username or any other relevant data
    this.fetchActiveTokenCount(); // Fetch token count
  }

  // Method to load the username of the current user
  loadUsername() {
    const userId = localStorage.getItem('currentUserId'); // Get the current user ID from local storage
    const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken'); // Get the auth token

    if (userId && token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`); // Create headers with authorization token

      this.http.get<any>(`http://localhost:3000/users/${userId}`, { headers }).subscribe(
        user => {
          this.username = user.username; // Set the username from the API response
          console.log(this.username);    // Log the username for debugging
        },
        error => {
          console.error('Error fetching user:', error); // Log error if fetching user fails
          if (error.status === 403) {
            this.snackBar.open('Access forbidden. Please login again.', 'Close', {
              duration: 3000, // Snackbar duration
            });
          }
        }
      );
    }
  }

  // Method to handle user logout
  logout() {
    const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken'); // Get the auth token
    if (!token) {
      this.router.navigateByUrl('/login'); // Navigate to login if no token found
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`); // Create headers with authorization token
    this.http.post<any>('http://localhost:3000/logout', {}, { headers }).subscribe(
      () => {
        this.fetchActiveTokenCount(); // Refresh active token count
        sessionStorage.removeItem('authToken'); // Clear session token
        localStorage.removeItem('authToken'); // Clear local storage token
        localStorage.removeItem('currentUserId'); // Clear local storage user ID
        this.cookieService.delete('username'); // Delete cookies
        this.cookieService.delete('password');
        this.cookieService.delete('rememberMe');
        this.activeUser = null; // Reset active user data
        this.router.navigateByUrl('/login'); // Navigate to login page
        this.snackBar.open('Logout successful', 'Close', {
          duration: 3000, // Snackbar duration
        });
      },
      (error: any) => {
        console.error('Logout error:', error); // Log error if logout fails
        this.snackBar.open('Logout failed. Please try again.', 'Close', {
          duration: 3000, // Snackbar duration
        });
      }
    );
  }

  // Method to fetch the count of active tokens
  fetchActiveTokenCount() {
    const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken'); // Get the auth token
    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`); // Create headers with authorization token

      this.http.get<any>('http://localhost:3000/active-tokens/count', { headers }).subscribe(
        response => {
          this.activeTokenCount = response.count; // Update the active token count
        },
        error => {
          console.error('Error fetching active token count:', error); // Log error if fetching token count fails
        }
      );
    }
  }
}
