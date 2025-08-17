# Events System Setup and Usage

This document explains how to set up and use the events system in Malinta Connect.

## Overview

The events system allows administrators to create, manage, and display community events. It follows the server-actions pattern where all Firebase operations are handled through server actions.

## Architecture

- **Server Actions**: All Firebase operations are in `app/actions/events.ts`
- **Admin Interface**: Event management at `/admin/events`
- **Public Display**: Event viewing at `/events`
- **Database**: Firebase Realtime Database with `events` node

## Database Structure

Events are stored in Firebase with the following structure:

```typescript
interface Event {
	id: string;
	name: string;
	date: string; // YYYY-MM-DD format
	time: string; // e.g., "07:00 - 11:00"
	location: string;
	description: string;
	category:
		| "community"
		| "health"
		| "education"
		| "sports"
		| "culture"
		| "government";
	organizer: string;
	contact: string;
	image?: string;
	status: "active" | "inactive";
	featured: boolean;
	createdAt: number;
	updatedAt: number;
}
```

## Setup Instructions

### 1. Install Dependencies

Make sure you have the required dependencies:

```bash
pnpm install
```

### 2. Environment Variables

Ensure your Firebase configuration is properly set up in:

- `app/firebase/firebase.ts` (client-side)
- `app/firebase/admin.ts` (server-side)

### 3. Seed Sample Data

Run the seed script to populate the database with sample events:

```bash
pnpm run seed:events
```

This will create 6 sample events in different categories.

## Usage

### Admin Interface (`/admin/events`)

Administrators can:

- View all events
- Create new events
- Edit existing events
- Delete events
- Toggle event status (active/inactive)
- Toggle featured status
- Filter events by category and status
- Search events by name or description

### Public Interface (`/events`)

Residents can:

- View all active events
- Filter events by category
- Search events
- See event details including date, time, location, and organizer

## Server Actions

### Core Operations

- `getAllEventsAction()` - Fetch all events
- `getEventAction(id)` - Fetch single event
- `createEventAction(eventData)` - Create new event
- `updateEventAction(eventData)` - Update existing event
- `deleteEventAction(id)` - Delete event

### Utility Operations

- `toggleEventStatusAction(id)` - Toggle active/inactive status
- `toggleFeaturedStatusAction(id)` - Toggle featured status
- `getEventsByCategoryAction(category)` - Filter by category
- `getFeaturedEventsAction()` - Get featured events only

## File Structure

```
app/
├── actions/
│   └── events.ts          # Server actions for events
├── admin/
│   └── events/
│       └── page.tsx       # Admin events management
└── (sites)/
    └── events/
        └── page.tsx       # Public events display

scripts/
└── seed-events.js         # Database seeding script
```

## Security Rules

The events system uses Firebase Admin SDK for server-side operations, ensuring:

- All database operations are authenticated
- Client-side code cannot directly access the database
- Proper error handling and validation

## Customization

### Adding New Categories

To add new event categories:

1. Update the `Event` interface in `app/actions/events.ts`
2. Add the category to the admin form in `app/admin/events/page.tsx`
3. Add the category to the public filter in `app/(sites)/events/page.tsx`
4. Add translations for the new category

### Modifying Event Fields

To add/modify event fields:

1. Update the `Event` interface
2. Update the `CreateEventData` interface
3. Modify the admin form
4. Update the public display
5. Update the seed script if needed

## Troubleshooting

### Common Issues

1. **Events not loading**: Check Firebase configuration and database rules
2. **Permission errors**: Ensure Firebase Admin SDK is properly configured
3. **Form submission errors**: Check server action error handling

### Debug Mode

Enable console logging in the browser to see detailed error messages from server actions.

## Performance Considerations

- Events are loaded once on page mount and cached in state
- Filtering and searching is done client-side for better performance
- Images are loaded from external URLs (consider implementing image optimization)
- Database queries are optimized with proper indexing

## Future Enhancements

- Event registration system
- Event reminders and notifications
- Calendar integration
- Image upload and management
- Event analytics and reporting
- Multi-language support for event content
