// Import necessary Angular and third-party modules
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClientModule } from '@angular/common/http'; // Note: This import is duplicated
import { CookieService } from 'ngx-cookie-service';

// Component decorator
@Component({
  selector: 'app-login',                // The name of the component selector
  standalone: true,                   // Indicates that this is a standalone component
  imports: [                          // Imports used in this component
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    HttpClientModule
  ],
  templateUrl: './login.component.html', // Path to the component's HTML template
  styleUrls: ['./login.component.scss']  // Path to the component's CSS stylesheet
})
export class LoginComponent {
  username: string = '';               // Variable to hold the username input value
  password: string = '';               // Variable to hold the password input value
  rememberMe: boolean = false;        // Flag to determine if credentials should be remembered

  // Constructor to initialize services and load remembered credentials
  constructor(
    private router: Router,             // Router service for navigation
    private http: HttpClient,           // HTTP client for making API requests
    private snackBar: MatSnackBar,      // Snackbar service for displaying messages
    private cookieService: CookieService // Service for managing cookies
  ) {
    this.loadRememberedCredentials();   // Load remembered credentials on initialization
  }

  // Method to load remembered credentials from cookies
  loadRememberedCredentials() {
    // Check if 'rememberMe' is set to true in cookies
    if (this.cookieService.check('rememberMe') && this.cookieService.get('rememberMe') === 'true') {
      // Load username and password from cookies if available
      this.username = this.cookieService.get('username') || '';
      this.password = this.cookieService.get('password') || '';
      this.rememberMe = true; // Set rememberMe flag to true
    }
  }

  // Method to handle form submission
  onSubmit() {
    // Create a user object with form values
    const user = {
      username: this.username,
      password: this.password,
      rememberMe: this.rememberMe
    };

    // Send a POST request to the login endpoint
    this.http.post('http://localhost:3000/login', user).subscribe(
      (response: any) => {
        console.log(response); // Log the response for debugging
        // Display success message using Snackbar
        this.snackBar.open(response.message, 'Close', {
          duration: 3000, // Snackbar duration
        });
        // Check if response contains a token
        if (response.token) {
          // Store token and user ID in local and session storage
          localStorage.setItem('authToken', response.token);
          sessionStorage.setItem('authToken', response.token);
          localStorage.setItem('currentUserId', response.userId);

          // Check if rememberMe is checked
          if (this.rememberMe) {
            // Store username, password, and rememberMe flag in cookies for 7 days
            this.cookieService.set('username', this.username, 7);
            this.cookieService.set('password', this.password, 7);
            this.cookieService.set('rememberMe', 'true', 7);
          } else {
            // Delete cookies if rememberMe is not checked
            this.cookieService.delete('username');
            this.cookieService.delete('password');
            this.cookieService.delete('rememberMe');
          }

          // Navigate to the dashboard page
          this.router.navigateByUrl('/dashboard');
        }
      },
      (error) => {
        // Display error message using Snackbar
        this.snackBar.open('Invalid credentials', 'Close', {
          duration: 3000, // Snackbar duration
        });
      }
    );
  }

  // Method to handle changes to the Remember Me checkbox
  onRememberMeChange() {
    console.log('Remember Me:', this.rememberMe); // Log the Remember Me status for debugging
  }
}
