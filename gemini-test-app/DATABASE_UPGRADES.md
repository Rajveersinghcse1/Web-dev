# Database Schema Upgrades

## Overview
This document outlines the database upgrades implemented for profile management, contact form submissions, and enhanced authentication validation.

## Schema Changes

### 1. Users Table - New Profile Fields
Added the following fields to the `users` table for profile customization:

```typescript
// New profile fields
nickname: v.optional(v.string()),      // User's preferred nickname
fullName: v.optional(v.string()),      // Full legal name
phone: v.optional(v.string()),         // Phone number
location: v.optional(v.string()),      // City, Country
bio: v.optional(v.string()),           // User bio/description
```

### 2. Contact Submissions Table (New)
Created a new `contactSubmissions` table to store and track contact form messages:

```typescript
contactSubmissions: defineTable({
  name: v.string(),                    // Sender name
  email: v.string(),                   // Sender email
  subject: v.string(),                 // Message subject
  message: v.string(),                 // Message content
  status: v.union(                     // Submission status
    v.literal("pending"),
    v.literal("replied"),
    v.literal("resolved")
  ),
  userId: v.optional(v.id("users")),   // Optional: for logged-in users
  createdAt: v.number(),
  updatedAt: v.number(),
})
```

**Indexes:**
- `by_email` - Track submissions by email
- `by_status` - Filter by status and date
- `by_user` - Track user's submissions

## Validation Rules

### Authentication Validation

#### Email Validation
- **Required**: Email cannot be empty
- **Format**: Must match regex pattern `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- **Length**: Maximum 255 characters
- **Uniqueness**: Email must be unique (no duplicates allowed)
- **Case**: Stored in lowercase for consistency

#### Password Validation (Sign Up)
- **Required**: Password cannot be empty
- **Minimum Length**: 8 characters
- **Maximum Length**: 128 characters
- **Uppercase**: Must contain at least one uppercase letter (A-Z)
- **Lowercase**: Must contain at least one lowercase letter (a-z)
- **Number**: Must contain at least one digit (0-9)

#### Name Validation
- **Required**: Name cannot be empty
- **Minimum Length**: 2 characters
- **Maximum Length**: 100 characters

### Profile Update Validation

#### Nickname
- **Minimum Length**: 2 characters
- **Maximum Length**: 50 characters

#### Phone
- **Maximum Length**: 20 characters

#### Location
- **Maximum Length**: 100 characters

#### Bio
- **Maximum Length**: 500 characters

### Contact Form Validation

#### Name
- **Required**: Cannot be empty
- **Minimum Length**: 2 characters
- **Maximum Length**: 100 characters

#### Email
- **Required**: Cannot be empty
- **Format**: Valid email format
- **Maximum Length**: 255 characters

#### Subject
- **Required**: Cannot be empty
- **Minimum Length**: 3 characters
- **Maximum Length**: 200 characters

#### Message
- **Required**: Cannot be empty
- **Minimum Length**: 10 characters
- **Maximum Length**: 2000 characters

#### Duplicate Prevention
- Prevents duplicate submissions from the same email with the same subject within 1 hour
- Error message: "You have already submitted a similar message recently. Please wait before submitting again."

## New Mutations

### 1. `auth.updateProfile`
Updates user profile information with validation.

**Parameters:**
```typescript
{
  userId: Id<"users">,
  name?: string,
  nickname?: string,
  fullName?: string,
  phone?: string,
  location?: string,
  bio?: string,
  avatarUrl?: string,
}
```

### 2. `contactSubmissions.submitContactForm`
Submits a new contact form with validation and duplicate checking.

**Parameters:**
```typescript
{
  name: string,
  email: string,
  subject: string,
  message: string,
  userId?: Id<"users">,
}
```

**Returns:**
```typescript
{
  submissionId: Id<"contactSubmissions">,
  success: boolean,
  message: string,
}
```

### 3. `contactSubmissions.updateContactStatus`
Updates the status of a contact submission (admin use).

**Parameters:**
```typescript
{
  submissionId: Id<"contactSubmissions">,
  status: "pending" | "replied" | "resolved",
}
```

## New Queries

### 1. `users.getUserProfile`
Retrieves complete user profile information.

**Parameters:**
```typescript
{ userId: Id<"users"> }
```

**Returns:** Full user profile including all profile fields.

### 2. `contactSubmissions.getUserContactSubmissions`
Gets all contact submissions for a specific user.

**Parameters:**
```typescript
{ userId: Id<"users"> }
```

### 3. `contactSubmissions.getAllContactSubmissions`
Gets all contact submissions (admin use), optionally filtered by status.

**Parameters:**
```typescript
{ status?: "pending" | "replied" | "resolved" }
```

## Component Updates

### ProfileView Component
- Integrated with `auth.updateProfile` mutation
- Fetches user profile data with `users.getUserProfile`
- Real-time validation feedback
- Success/error message display
- Loading states during save operations
- Auto-populated fields from database

### ContactUs Component
- Integrated with `contactSubmissions.submitContactForm` mutation
- Auto-fills name and email for logged-in users
- Real-time validation feedback
- Duplicate submission prevention
- Success/error message display
- Form reset after successful submission

## Security Features

1. **Email Uniqueness**: Prevents duplicate user accounts
2. **Password Strength**: Enforces strong passwords with multiple requirements
3. **Input Validation**: All fields validated before database operations
4. **Case Normalization**: Emails stored in lowercase for consistency
5. **Spam Prevention**: Contact form duplicate checking within 1-hour window
6. **Field Length Limits**: Prevents database overflow and DoS attacks
7. **Optional User Tracking**: Links contact submissions to user accounts when logged in

## Error Handling

All mutations return descriptive error messages:
- "Email is required"
- "Invalid email format"
- "Password must be at least 8 characters long"
- "User with this email already exists"
- "Name must be at least 2 characters long"
- "Bio is too long (max 500 characters)"
- "You have already submitted a similar message recently"

## Database Performance

### Indexes Added
- `users.by_email` - Fast email lookups
- `contactSubmissions.by_email` - Track submissions by email
- `contactSubmissions.by_status` - Filter by status
- `contactSubmissions.by_user` - User's submission history

### Best Practices
- Denormalized user stats for O(1) retrieval
- Indexed fields for fast queries
- Timestamp tracking for audit trails
- Status field for workflow management

## Migration Notes

Existing users will have null values for new profile fields. The application gracefully handles this with:
- Optional field types in schema
- Fallback to existing `name` field
- "Not set" display for empty fields
- Validation only on update, not on display

## Future Enhancements

Potential improvements:
1. Email verification for contact submissions
2. Rate limiting for contact form submissions
3. Admin dashboard for managing contact submissions
4. Email notifications for new submissions
5. Contact submission replies/threads
6. User notification preferences
7. Profile picture upload to storage
8. Two-factor authentication
9. Password reset functionality
10. User activity logs
