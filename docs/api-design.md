# AI Image Platform API Design

## Overview

This document outlines the comprehensive REST API design for the AI Image Platform - a ComfyUI/A1111 workflow specialized community platform. The API follows RESTful principles, provides comprehensive error handling, and implements robust authentication and authorization.

## Base Configuration

- **Base URL**: `/api/v1`
- **Content-Type**: `application/json`
- **Authentication**: Bearer Token (JWT)
- **Rate Limiting**: Varies by endpoint (detailed below)
- **API Version**: v1

## Authentication & Authorization

### JWT Token Structure
```json
{
  "sub": "user-uuid",
  "username": "string",
  "email": "string",
  "isAdmin": "boolean",
  "isVerified": "boolean",
  "exp": "number",
  "iat": "number"
}
```

### Auth Endpoints

#### OAuth Authentication
The platform uses OAuth 2.0 for authentication with support for Google, GitHub, and Facebook providers.

#### GET /auth/google
Initiate Google OAuth authentication.

**Response:** `302 Redirect`
- Redirects to Google OAuth consent screen

**Rate Limit:** 10 requests per 15 minutes per IP

#### GET /auth/google/callback
Google OAuth callback endpoint.

**Query Parameters:**
- `code`: Authorization code from Google
- `state`: State parameter for CSRF protection

**Response:** `302 Redirect`
- Redirects to frontend with access token: `${FRONTEND_URL}/auth/callback?token=${accessToken}`

**Errors:**
- `400` - Invalid authorization code
- `401` - OAuth authentication failed

#### GET /auth/github
Initiate GitHub OAuth authentication.

**Response:** `302 Redirect`
- Redirects to GitHub OAuth consent screen

**Rate Limit:** 10 requests per 15 minutes per IP

#### GET /auth/github/callback
GitHub OAuth callback endpoint.

**Query Parameters:**
- `code`: Authorization code from GitHub
- `state`: State parameter for CSRF protection

**Response:** `302 Redirect`
- Redirects to frontend with access token: `${FRONTEND_URL}/auth/callback?token=${accessToken}`

**Errors:**
- `400` - Invalid authorization code
- `401` - OAuth authentication failed

#### GET /auth/facebook
Initiate Facebook OAuth authentication.

**Response:** `302 Redirect`
- Redirects to Facebook OAuth consent screen

**Rate Limit:** 10 requests per 15 minutes per IP

#### GET /auth/facebook/callback
Facebook OAuth callback endpoint.

**Query Parameters:**
- `code`: Authorization code from Facebook
- `state`: State parameter for CSRF protection

**Response:** `302 Redirect`
- Redirects to frontend with access token: `${FRONTEND_URL}/auth/callback?token=${accessToken}`

**Errors:**
- `400` - Invalid authorization code
- `401` - OAuth authentication failed

#### OAuth User Creation Process
When a user authenticates via OAuth:
1. Check if user exists with OAuth provider ID
2. If not found, check if user exists by email
3. If email exists, link OAuth account to existing user
4. If user doesn't exist, create new user with:
   - Verified status: `true` (OAuth users are pre-verified)
   - Active status: `true`
   - Unique username generated from email prefix
   - Display name from OAuth provider
   - Avatar URL from OAuth provider

#### OAuth Token Response Format
All OAuth callbacks redirect to frontend with JWT token containing:
```json
{
  "sub": "user-uuid",
  "email": "string",
  "exp": "number",
  "iat": "number"
}
```

#### POST /auth/logout
Invalidate current session tokens.

**Headers:** `Authorization: Bearer <token>`

**Response:** `204 No Content`

#### GET /auth/profile
Get current user profile information.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "email": "string",
  "username": "string",
  "displayName": "string?",
  "avatarUrl": "string?",
  "bio": "string?",
  "isVerified": "boolean",
  "totalUploads": "number",
  "totalLikesReceived": "number",
  "followerCount": "number",
  "followingCount": "number",
  "createdAt": "ISO8601",
  "preferences": {
    "theme": "light|dark|auto",
    "nsfwFilter": "boolean",
    "emailNotifications": "boolean",
    "pushNotifications": "boolean"
  }
}
```

## Image Management

### GET /images
Retrieve paginated list of images with filtering and sorting.

**Query Parameters:**
```typescript
{
  page?: number = 1,
  limit?: number = 20,
  sort?: 'newest' | 'popular' | 'trending' | 'mostLiked' = 'newest',
  category?: string,
  aiModel?: string,
  hasWorkflow?: boolean,
  aspectRatio?: 'square' | 'portrait' | 'landscape',
  tags?: string[], // comma-separated
  userId?: string,
  nsfw?: boolean = false,
  timeRange?: '1d' | '1w' | '1m' | '3m' | 'all' = 'all'
}
```

**Response:** `200 OK`
```json
{
  "images": [
    {
      "id": "uuid",
      "filename": "string",
      "imagePath": "string",
      "width": "number",
      "height": "number",
      "aspectRatio": "number",
      "dominantColor": "string?",
      "title": "string?",
      "description": "string?",
      "hasWorkflow": "boolean",
      "workflowComplexity": "number",
      "isNsfw": "boolean",
      "viewCount": "number",
      "likeCount": "number",
      "bookmarkCount": "number",
      "commentCount": "number",
      "downloadCount": "number",
      "uploadedAt": "ISO8601",
      "user": {
        "id": "uuid",
        "username": "string",
        "displayName": "string?",
        "avatarUrl": "string?"
      },
      "tags": ["string"],
      "generationParams": {
        "model": "string?",
        "sampler": "string?",
        "steps": "number?",
        "cfgScale": "number?",
        "seed": "string?",
        "prompt": "string?",
        "negativePrompt": "string?"
      }
    }
  ],
  "pagination": {
    "page": "number",
    "limit": "number",
    "total": "number",
    "totalPages": "number",
    "hasNext": "boolean",
    "hasPrev": "boolean"
  }
}
```

**Rate Limit:** 100 requests per hour per user

### POST /images/upload
Upload single or multiple images with metadata.

**Headers:** `Authorization: Bearer <token>`
**Content-Type:** `multipart/form-data`

**Request Body:**
```typescript
{
  files: File[], // max 10 files, 50MB each
  metadata?: {
    title?: string,
    description?: string,
    tags?: string[],
    isNsfw?: boolean,
    isPublic?: boolean,
    licenseType?: number,
    commercialUse?: boolean
  }
}
```

**Response:** `201 Created`
```json
{
  "uploadedImages": [
    {
      "id": "uuid",
      "filename": "string",
      "imagePath": "string",
      "width": "number",
      "height": "number",
      "fileSize": "number",
      "mimeType": "string",
      "uploadedAt": "ISO8601",
      "processingStatus": "pending|processing|completed|failed"
    }
  ],
  "processingJobs": ["uuid"]
}
```

**Errors:**
- `400` - Invalid file format or size
- `401` - Unauthorized
- `413` - File too large
- `422` - Invalid metadata

**Rate Limit:** 20 uploads per hour per user

### GET /images/{id}
Get detailed information about a specific image.

**Path Parameters:**
- `id`: Image UUID

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "filename": "string",
  "originalFilename": "string",
  "imagePath": "string",
  "fileSize": "number",
  "mimeType": "string",
  "width": "number",
  "height": "number",
  "aspectRatio": "number",
  "dominantColor": "string?",
  "averageBrightness": "number?",
  "colorPalette": "object?",
  "title": "string?",
  "description": "string?",
  "exifData": "object?",
  "generationParams": {
    "model": "string?",
    "sampler": "string?",
    "steps": "number?",
    "cfgScale": "number?",
    "seed": "string?",
    "prompt": "string?",
    "negativePrompt": "string?"
  },
  "hasWorkflow": "boolean",
  "workflowComplexity": "number",
  "isNsfw": "boolean",
  "isPublic": "boolean",
  "licenseType": "number",
  "commercialUse": "boolean",
  "viewCount": "number",
  "uniqueViewCount": "number",
  "likeCount": "number",
  "bookmarkCount": "number",
  "commentCount": "number",
  "downloadCount": "number",
  "shareCount": "number",
  "popularityScore": "number",
  "trendingScore": "number",
  "takenAt": "ISO8601?",
  "uploadedAt": "ISO8601",
  "updatedAt": "ISO8601",
  "user": {
    "id": "uuid",
    "username": "string",
    "displayName": "string?",
    "avatarUrl": "string?",
    "isVerified": "boolean"
  },
  "tags": [
    {
      "id": "uuid",
      "name": "string",
      "category": "string",
      "color": "string?",
      "isAutoGenerated": "boolean"
    }
  ],
  "userInteraction": {
    "hasLiked": "boolean",
    "hasBookmarked": "boolean",
    "hasViewed": "boolean"
  }
}
```

**Errors:**
- `404` - Image not found
- `403` - Access denied (private image)

### PUT /images/{id}
Update image metadata (owner only).

**Headers:** `Authorization: Bearer <token>`
**Path Parameters:**
- `id`: Image UUID

**Request Body:**
```json
{
  "title": "string?",
  "description": "string?",
  "isNsfw": "boolean?",
  "isPublic": "boolean?",
  "tags": "string[]?"
}
```

**Response:** `200 OK` (Updated image object)

**Errors:**
- `403` - Not image owner
- `404` - Image not found

### DELETE /images/{id}
Delete an image (owner or admin only).

**Headers:** `Authorization: Bearer <token>`
**Path Parameters:**
- `id`: Image UUID

**Query Parameters:**
- `reason`: Deletion reason (required for admin deletions)

**Response:** `204 No Content`

**Errors:**
- `403` - Not authorized to delete
- `404` - Image not found

### POST /images/{id}/like
Like or unlike an image.

**Headers:** `Authorization: Bearer <token>`
**Path Parameters:**
- `id`: Image UUID

**Response:** `200 OK`
```json
{
  "liked": "boolean",
  "likeCount": "number"
}
```

### POST /images/{id}/bookmark
Bookmark or unbookmark an image.

**Headers:** `Authorization: Bearer <token>`
**Path Parameters:**
- `id`: Image UUID

**Response:** `200 OK`
```json
{
  "bookmarked": "boolean",
  "bookmarkCount": "number"
}
```

### POST /images/{id}/view
Record a view for an image (increments view count).

**Path Parameters:**
- `id`: Image UUID

**Request Body:**
```json
{
  "referrer": "string?",
  "userAgent": "string?"
}
```

**Response:** `200 OK`
```json
{
  "viewCount": "number",
  "uniqueViewCount": "number"
}
```

**Rate Limit:** 1 view per image per IP per hour

### GET /images/{id}/download
Download original image file.

**Path Parameters:**
- `id`: Image UUID

**Response:** `200 OK`
- **Content-Type:** Original image MIME type
- **Content-Disposition:** `attachment; filename="original-filename.ext"`
- Binary image data

**Errors:**
- `404` - Image not found
- `403` - Download not allowed

**Rate Limit:** 50 downloads per hour per user

## Workflow Management

### GET /workflows/{imageId}
Get workflow data associated with an image.

**Path Parameters:**
- `imageId`: Image UUID

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "workflowData": "object",
  "workflowHash": "string",
  "workflowType": "number",
  "workflowVersion": "string?",
  "title": "string?",
  "description": "string?",
  "category": "string?",
  "nodeCount": "number",
  "nodeTypes": "object",
  "requiredModels": "object",
  "requiredLoras": "object",
  "difficultyLevel": "number",
  "licenseType": "number",
  "commercialUse": "boolean",
  "downloadCount": "number",
  "favoriteCount": "number",
  "ratingAvg": "number",
  "ratingCount": "number",
  "isPublic": "boolean",
  "createdAt": "ISO8601"
}
```

**Errors:**
- `404` - Workflow not found
- `403` - Workflow not public

### POST /workflows/parse
Parse and validate ComfyUI workflow JSON.

**Headers:** `Authorization: Bearer <token>`
**Content-Type:** `multipart/form-data` or `application/json`

**Request Body (Form Data):**
```typescript
{
  file: File // workflow.json file
}
```

**Request Body (JSON):**
```json
{
  "workflowData": "object",
  "title": "string?",
  "description": "string?",
  "category": "string?"
}
```

**Response:** `200 OK`
```json
{
  "isValid": "boolean",
  "workflowHash": "string",
  "nodeCount": "number",
  "nodeTypes": "string[]",
  "requiredModels": "string[]",
  "requiredLoras": "string[]",
  "difficultyLevel": "number",
  "errors": "string[]",
  "warnings": "string[]",
  "metadata": {
    "version": "string",
    "author": "string?",
    "description": "string?"
  }
}
```

### GET /workflows/{id}/download
Download workflow JSON file.

**Path Parameters:**
- `id`: Workflow UUID

**Response:** `200 OK`
- **Content-Type:** `application/json`
- **Content-Disposition:** `attachment; filename="workflow.json"`
- Workflow JSON data

**Rate Limit:** 100 downloads per hour per user

### POST /workflows/{id}/favorite
Favorite or unfavorite a workflow.

**Headers:** `Authorization: Bearer <token>`
**Path Parameters:**
- `id`: Workflow UUID

**Response:** `200 OK`
```json
{
  "favorited": "boolean",
  "favoriteCount": "number"
}
```

### POST /workflows/{id}/rate
Rate a workflow (1-5 stars).

**Headers:** `Authorization: Bearer <token>`
**Path Parameters:**
- `id`: Workflow UUID

**Request Body:**
```json
{
  "rating": "number", // 1-5
  "review": "string?"
}
```

**Response:** `200 OK`
```json
{
  "rating": "number",
  "ratingAvg": "number",
  "ratingCount": "number"
}
```

## Search & Discovery

### GET /search
Global search across images, users, and collections.

**Query Parameters:**
```typescript
{
  q: string, // search query
  type?: 'images' | 'users' | 'collections' | 'all' = 'all',
  page?: number = 1,
  limit?: number = 20,
  sort?: 'relevance' | 'newest' | 'popular' = 'relevance',
  filters?: {
    hasWorkflow?: boolean,
    nsfw?: boolean,
    aiModel?: string,
    tags?: string[],
    dateRange?: string,
    aspectRatio?: string
  }
}
```

**Response:** `200 OK`
```json
{
  "results": {
    "images": [
      {
        // Image object with highlight snippets
        "relevanceScore": "number",
        "highlights": {
          "title": "string?",
          "description": "string?",
          "tags": "string[]?"
        }
      }
    ],
    "users": [
      {
        // User object with relevance
        "relevanceScore": "number"
      }
    ],
    "collections": [
      {
        // Collection object with relevance
        "relevanceScore": "number"
      }
    ]
  },
  "pagination": {
    "page": "number",
    "limit": "number",
    "total": "number",
    "totalPages": "number"
  },
  "suggestions": "string[]",
  "facets": {
    "tags": [{"name": "string", "count": "number"}],
    "models": [{"name": "string", "count": "number"}],
    "users": [{"username": "string", "count": "number"}]
  }
}
```

**Rate Limit:** 200 requests per hour per user

### GET /search/suggestions
Get search suggestions and autocomplete.

**Query Parameters:**
- `q`: Partial query string
- `type`: Suggestion type (`tags`, `models`, `users`, `all`)

**Response:** `200 OK`
```json
{
  "suggestions": [
    {
      "text": "string",
      "type": "tag|model|user",
      "count": "number"
    }
  ]
}
```

**Rate Limit:** 500 requests per hour per user

## Collections Management

### GET /collections
Get paginated list of collections.

**Query Parameters:**
```typescript
{
  page?: number = 1,
  limit?: number = 20,
  sort?: 'newest' | 'popular' | 'mostItems' = 'newest',
  featured?: boolean,
  userId?: string
}
```

**Response:** `200 OK`
```json
{
  "collections": [
    {
      "id": "uuid",
      "name": "string",
      "description": "string?",
      "isPublic": "boolean",
      "isFeatured": "boolean",
      "itemCount": "number",
      "viewCount": "number",
      "likeCount": "number",
      "createdAt": "ISO8601",
      "updatedAt": "ISO8601",
      "user": {
        "id": "uuid",
        "username": "string",
        "displayName": "string?",
        "avatarUrl": "string?"
      },
      "coverImage": {
        "id": "uuid",
        "imagePath": "string",
        "aspectRatio": "number"
      },
      "previewImages": [
        {
          "id": "uuid",
          "imagePath": "string",
          "aspectRatio": "number"
        }
      ]
    }
  ],
  "pagination": "PaginationObject"
}
```

### POST /collections
Create a new collection.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "string",
  "description": "string?",
  "isPublic": "boolean",
  "coverImageId": "uuid?"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "name": "string",
  "description": "string?",
  "isPublic": "boolean",
  "itemCount": 0,
  "createdAt": "ISO8601"
}
```

### GET /collections/{id}
Get collection details with items.

**Path Parameters:**
- `id`: Collection UUID

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "name": "string",
  "description": "string?",
  "isPublic": "boolean",
  "isFeatured": "boolean",
  "itemCount": "number",
  "viewCount": "number",
  "likeCount": "number",
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601",
  "user": "UserObject",
  "items": [
    {
      "id": "uuid",
      "addedAt": "ISO8601",
      "addedBy": "UserObject",
      "image": "ImageObject"
    }
  ],
  "pagination": "PaginationObject"
}
```

### PUT /collections/{id}
Update collection information (owner only).

**Headers:** `Authorization: Bearer <token>`
**Path Parameters:**
- `id`: Collection UUID

**Request Body:**
```json
{
  "name": "string?",
  "description": "string?",
  "isPublic": "boolean?",
  "coverImageId": "uuid?"
}
```

**Response:** `200 OK` (Updated collection object)

### DELETE /collections/{id}
Delete a collection (owner only).

**Headers:** `Authorization: Bearer <token>`
**Path Parameters:**
- `id`: Collection UUID

**Response:** `204 No Content`

### POST /collections/{id}/items
Add images to collection.

**Headers:** `Authorization: Bearer <token>`
**Path Parameters:**
- `id`: Collection UUID

**Request Body:**
```json
{
  "imageIds": "uuid[]"
}
```

**Response:** `200 OK`
```json
{
  "addedCount": "number",
  "skippedCount": "number",
  "errors": "string[]"
}
```

### DELETE /collections/{id}/items/{imageId}
Remove image from collection.

**Headers:** `Authorization: Bearer <token>`
**Path Parameters:**
- `id`: Collection UUID
- `imageId`: Image UUID

**Response:** `204 No Content`

## User Management & Social Features

### GET /users/{username}
Get user profile information.

**Path Parameters:**
- `username`: User's username

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "username": "string",
  "displayName": "string?",
  "avatarUrl": "string?",
  "bio": "string?",
  "isVerified": "boolean",
  "totalUploads": "number",
  "totalLikesReceived": "number",
  "followerCount": "number",
  "followingCount": "number",
  "createdAt": "ISO8601",
  "isFollowing": "boolean?",
  "recentImages": [
    "ImageObject" // Latest 6 images
  ]
}
```

### GET /users/{username}/images
Get user's uploaded images.

**Path Parameters:**
- `username`: User's username

**Query Parameters:**
- `page`, `limit`, `sort` (same as /images endpoint)

**Response:** Same as `/images` endpoint

### GET /users/{username}/collections
Get user's collections.

**Path Parameters:**
- `username`: User's username

**Query Parameters:**
- `page`, `limit` (pagination)

**Response:** Same as `/collections` endpoint

### GET /users/{username}/liked
Get images liked by user.

**Headers:** `Authorization: Bearer <token>` (owner only or public)
**Path Parameters:**
- `username`: User's username

**Response:** Same as `/images` endpoint

### GET /users/{username}/bookmarks
Get user's bookmarked images.

**Headers:** `Authorization: Bearer <token>` (owner only)
**Path Parameters:**
- `username`: User's username

**Response:** Same as `/images` endpoint

### POST /users/{username}/follow
Follow or unfollow a user.

**Headers:** `Authorization: Bearer <token>`
**Path Parameters:**
- `username`: User's username

**Response:** `200 OK`
```json
{
  "following": "boolean",
  "followerCount": "number"
}
```

### GET /users/{username}/followers
Get user's followers list.

**Path Parameters:**
- `username`: User's username

**Query Parameters:**
- `page`, `limit`

**Response:** `200 OK`
```json
{
  "followers": [
    {
      "id": "uuid",
      "username": "string",
      "displayName": "string?",
      "avatarUrl": "string?",
      "followedAt": "ISO8601"
    }
  ],
  "pagination": "PaginationObject"
}
```

### GET /users/{username}/following
Get list of users this user follows.

**Path Parameters:**
- `username`: User's username

**Query Parameters:**
- `page`, `limit`

**Response:** Same structure as `/followers`

## Comments System

### GET /images/{imageId}/comments
Get comments for an image.

**Path Parameters:**
- `imageId`: Image UUID

**Query Parameters:**
```typescript
{
  page?: number = 1,
  limit?: number = 20,
  sort?: 'newest' | 'oldest' | 'popular' = 'newest',
  parentId?: string // For nested comments
}
```

**Response:** `200 OK`
```json
{
  "comments": [
    {
      "id": "uuid",
      "content": "string",
      "contentType": "number",
      "isEdited": "boolean",
      "isPinned": "boolean",
      "isVerified": "boolean",
      "likeCount": "number",
      "replyCount": "number",
      "createdAt": "ISO8601",
      "editedAt": "ISO8601?",
      "user": {
        "id": "uuid",
        "username": "string",
        "displayName": "string?",
        "avatarUrl": "string?",
        "isVerified": "boolean"
      },
      "userInteraction": {
        "hasLiked": "boolean"
      },
      "replies": [
        // Nested comment objects (limited depth)
      ]
    }
  ],
  "pagination": "PaginationObject"
}
```

### POST /images/{imageId}/comments
Add a comment to an image.

**Headers:** `Authorization: Bearer <token>`
**Path Parameters:**
- `imageId`: Image UUID

**Request Body:**
```json
{
  "content": "string",
  "parentCommentId": "uuid?" // For replies
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "content": "string",
  "contentType": 0,
  "likeCount": 0,
  "replyCount": 0,
  "createdAt": "ISO8601",
  "user": "UserObject"
}
```

**Rate Limit:** 30 comments per hour per user

### PUT /comments/{id}
Edit a comment (author only, within 24 hours).

**Headers:** `Authorization: Bearer <token>`
**Path Parameters:**
- `id`: Comment UUID

**Request Body:**
```json
{
  "content": "string"
}
```

**Response:** `200 OK` (Updated comment object)

### DELETE /comments/{id}
Delete a comment (author or admin only).

**Headers:** `Authorization: Bearer <token>`
**Path Parameters:**
- `id`: Comment UUID

**Response:** `204 No Content`

### POST /comments/{id}/like
Like or unlike a comment.

**Headers:** `Authorization: Bearer <token>`
**Path Parameters:**
- `id`: Comment UUID

**Response:** `200 OK`
```json
{
  "liked": "boolean",
  "likeCount": "number"
}
```

## Notifications System

### GET /notifications
Get user's notifications.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
```typescript
{
  page?: number = 1,
  limit?: number = 20,
  type?: 'like' | 'comment' | 'follow' | 'collection' | 'all' = 'all',
  unread?: boolean,
  since?: string // ISO8601 date
}
```

**Response:** `200 OK`
```json
{
  "notifications": [
    {
      "id": "uuid",
      "type": "string",
      "title": "string",
      "message": "string",
      "isRead": "boolean",
      "createdAt": "ISO8601",
      "actorUser": {
        "id": "uuid",
        "username": "string",
        "displayName": "string?",
        "avatarUrl": "string?"
      },
      "targetImage": {
        "id": "uuid",
        "imagePath": "string",
        "title": "string?"
      },
      "targetCollection": {
        "id": "uuid",
        "name": "string"
      },
      "targetComment": {
        "id": "uuid",
        "content": "string"
      },
      "targetWorkflow": {
        "id": "uuid",
        "title": "string?"
      },
      "actionUrl": "string"
    }
  ],
  "pagination": "PaginationObject",
  "unreadCount": "number"
}
```

### PATCH /notifications/{id}/read
Mark notification as read.

**Headers:** `Authorization: Bearer <token>`
**Path Parameters:**
- `id`: Notification UUID

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "isRead": true,
  "readAt": "ISO8601"
}
```

### PATCH /notifications/read-all
Mark all notifications as read.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "markedCount": "number"
}
```

### GET /notifications/unread-count
Get count of unread notifications.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "unreadCount": "number"
}
```

**Rate Limit:** 100 requests per hour per user

## Admin Endpoints

### GET /admin/stats
Get platform statistics (admin only).

**Headers:** `Authorization: Bearer <token>` (admin)

**Response:** `200 OK`
```json
{
  "users": {
    "total": "number",
    "active": "number",
    "verified": "number",
    "newToday": "number",
    "newThisWeek": "number"
  },
  "images": {
    "total": "number",
    "public": "number",
    "withWorkflow": "number",
    "uploadedToday": "number",
    "uploadedThisWeek": "number"
  },
  "workflows": {
    "total": "number",
    "public": "number",
    "avgRating": "number"
  },
  "engagement": {
    "totalViews": "number",
    "totalLikes": "number",
    "totalComments": "number",
    "totalDownloads": "number"
  }
}
```

### GET /admin/reports
Get content reports (admin only).

**Headers:** `Authorization: Bearer <token>` (admin)

**Query Parameters:**
- `status`: Report status (`pending`, `reviewed`, `resolved`)
- `type`: Report type (`image`, `user`, `comment`)
- `page`, `limit`

**Response:** `200 OK`
```json
{
  "reports": [
    {
      "id": "uuid",
      "reportType": "string",
      "reason": "string",
      "description": "string",
      "status": "string",
      "createdAt": "ISO8601",
      "reviewedAt": "ISO8601?",
      "resolvedAt": "ISO8601?",
      "reporterUser": "UserObject",
      "reportedUser": "UserObject?",
      "reportedImage": "ImageObject?",
      "reportedComment": "CommentObject?",
      "reviewedByAdmin": "UserObject?"
    }
  ],
  "pagination": "PaginationObject"
}
```

### PATCH /admin/reports/{id}
Update report status (admin only).

**Headers:** `Authorization: Bearer <token>` (admin)
**Path Parameters:**
- `id`: Report UUID

**Request Body:**
```json
{
  "status": "reviewed|resolved|dismissed",
  "adminNotes": "string?"
}
```

**Response:** `200 OK` (Updated report object)

### POST /admin/users/{id}/suspend
Suspend user account (admin only).

**Headers:** `Authorization: Bearer <token>` (admin)
**Path Parameters:**
- `id`: User UUID

**Request Body:**
```json
{
  "reason": "string",
  "duration": "number", // days, 0 for permanent
  "deleteContent": "boolean"
}
```

**Response:** `200 OK`

### DELETE /admin/images/{id}
Admin delete image with reason.

**Headers:** `Authorization: Bearer <token>` (admin)
**Path Parameters:**
- `id`: Image UUID

**Request Body:**
```json
{
  "reason": "string",
  "notifyUser": "boolean"
}
```

**Response:** `204 No Content`

## Error Responses

### Standard Error Format
All error responses follow this structure:

```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": "string?",
    "timestamp": "ISO8601",
    "path": "string",
    "requestId": "uuid"
  },
  "validation": [
    {
      "field": "string",
      "message": "string",
      "value": "any"
    }
  ]
}
```

### Common HTTP Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `204 No Content` - Request successful, no response body
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Access denied
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (duplicate)
- `413 Payload Too Large` - File too large
- `422 Unprocessable Entity` - Validation errors
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

### Error Codes

| Code | Description |
|------|-------------|
| `AUTH_001` | Invalid credentials |
| `AUTH_002` | Token expired |
| `AUTH_003` | Account not verified |
| `AUTH_004` | Account suspended |
| `VAL_001` | Required field missing |
| `VAL_002` | Invalid field format |
| `VAL_003` | Field value out of range |
| `UPLOAD_001` | File too large |
| `UPLOAD_002` | Invalid file format |
| `UPLOAD_003` | Upload limit exceeded |
| `RATE_001` | Rate limit exceeded |

## Rate Limiting

Rate limits are applied per user (authenticated) or per IP (anonymous). Headers included in responses:

- `X-RateLimit-Limit`: Request limit per time window
- `X-RateLimit-Remaining`: Requests remaining in current window
- `X-RateLimit-Reset`: Time when limit resets (Unix timestamp)

### Rate Limits by Endpoint Category

| Endpoint Category | Limit | Window |
|------------------|-------|---------|
| Authentication | 5 requests | 15 minutes |
| Image Upload | 20 requests | 1 hour |
| Image Download | 50 requests | 1 hour |
| Comments | 30 requests | 1 hour |
| Search | 200 requests | 1 hour |
| General API | 1000 requests | 1 hour |

## WebSocket Events (Future Enhancement)

For real-time features like notifications and live comments:

```typescript
// Connection
const ws = new WebSocket(`wss://api.domain.com/ws?token=${accessToken}`);

// Events
interface WSEvent {
  type: 'notification' | 'comment' | 'like' | 'follow';
  data: any;
  timestamp: string;
}
```

## API Versioning

- Current version: `v1`
- Version specified in URL path: `/api/v1/...`
- Breaking changes will introduce new version
- Previous versions supported for 12 months after new release
- Deprecation notices sent via `X-API-Deprecated` header

## Security Considerations

- All endpoints use HTTPS only
- JWT tokens expire in 15 minutes (access) / 30 days (refresh)
- Password minimum requirements: 8 characters, mixed case, numbers
- File uploads scanned for malware
- Rate limiting prevents abuse
- CORS configured for allowed origins
- SQL injection protection via parameterized queries
- XSS protection via input sanitization
- CSRF protection for state-changing operations

## Content Delivery Network (CDN)

Image URLs are served through CloudFront CDN:

```
https://cdn.domain.com/images/{userId}/{imageId}/
├── thumbnail_300.webp
├── medium_800.webp  
├── large_1200.webp
└── original.{ext}
```

Cache headers:
- Images: `Cache-Control: public, max-age=31536000` (1 year)
- API responses: `Cache-Control: public, max-age=300` (5 minutes)
- User content: `Cache-Control: private, max-age=0`

This comprehensive API design provides a solid foundation for building the AI Image Platform with all the required functionality for ComfyUI/A1111 workflow sharing, community features, and content management.