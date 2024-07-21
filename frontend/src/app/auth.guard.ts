// Importing the necessary functions and classes from Angular core and router modules
import { inject } from '@angular/core'; // Angular's `inject` function to get services
import { CanActivateFn, Router } from '@angular/router'; // `CanActivateFn` for route guard, `Router` for navigation

// Define an authentication guard function using `CanActivateFn`
export const authGuard: CanActivateFn = (route, state) => {
  // Use Angular's `inject` function to get the `Router` instance
  const router = inject(Router);

  // Retrieve the authentication token from session storage
  const token = sessionStorage.getItem('authToken');

  // Check if the token exists (i.e., the user is authenticated)
  if (token) {
    // Optionally, you can add more JWT validation here to check token validity
    return true; // Allow navigation if the token is present
  } else {
    // If the token is not present, redirect the user to the login page
    router.navigate(['/login']);
    return false; // Prevent navigation if the token is missing
  }
};

// Define a logout function to handle user logout
export function logout() {
  // Use Angular's `inject` function to get the `Router` instance
  const router = inject(Router);

  // Remove the authentication token from session storage
  sessionStorage.removeItem('authToken');

  // Navigate the user to the login page after logout
  router.navigate(['/login']);
}
