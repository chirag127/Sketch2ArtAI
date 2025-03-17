# Admin Setup for Sketch2ArtAI

This document explains how to set up and use the admin functionality in Sketch2ArtAI.

## Setting Up Admin User

The application has been configured with admin functionality to allow viewing all user history. The admin email is set to `whyiswhen@gmail.com`.

To set up the admin user:

1. Make sure MongoDB is running and connected to your application
2. Run the admin setup script:
    - On Windows: Double-click the `set-admin.bat` file in the backend directory
    - On Mac/Linux: Run `node scripts/setAdmin.js` from the backend directory

The script will:

-   Check if a user with the email `whyiswhen@gmail.com` exists
-   If the user exists, it will be granted admin privileges
-   If the user doesn't exist, a new admin user will be created with the password `Admin@123`

## Admin Features

Once logged in as an admin user, you will have access to:

1. **Admin History View**: A button will appear on the History screen that allows you to view all users' conversion history
2. The admin history view shows:
    - All conversions from all users
    - The email of the user who created each conversion
    - The original and converted images
    - Conversion details (style, prompt, etc.)

## Security Considerations

-   The admin user has access to all user history data
-   Admin privileges are checked on both the client and server side
-   Only users with the `isAdmin` flag set to `true` in the database can access admin features
-   All admin API endpoints are protected with authentication and admin middleware

## Troubleshooting

If you encounter issues with admin functionality:

1. Make sure the admin user is properly set up by running the script again
2. Check that you're logged in with the correct admin email
3. Verify that the backend server is running and accessible
4. Check the server logs for any authorization errors
