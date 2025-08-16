# Firebase Realtime Database Setup & Usage

This project is now configured to use Firebase Realtime Database with a comprehensive set of utilities and React hooks.

## Setup

### 1. Firebase Configuration

The Firebase configuration is already set up in `app/firebase/firebase.ts`. Make sure to:

- Update the `databaseURL` in the firebase config to match your actual Realtime Database URL
- The URL format should be: `https://[YOUR_PROJECT_ID]-default-rtdb.firebaseio.com`

### 2. Database Rules

Set up your Realtime Database rules in the Firebase Console. Here's a basic example:

```json
{
	"rules": {
		".read": "auth != null",
		".write": "auth != null",
		"messages": {
			".read": true,
			".write": true
		}
	}
}
```

## Available Utilities

### Core Database Functions (`lib/firebase-db.ts`)

#### Basic CRUD Operations

- `setData(path, data)` - Create or update data at a specific path
- `getData(path)` - Retrieve data from a specific path
- `pushData(path, data)` - Add new data to a list (auto-generates key)
- `updateData(path, updates)` - Update specific fields without overwriting
- `deleteData(path)` - Remove data at a specific path

#### Real-time Listeners

- `listenToData(path, callback, errorCallback)` - Listen to data changes in real-time
- `listenToQuery(path, callback, queryOptions, errorCallback)` - Listen to filtered data in real-time

#### Query Operations

- `queryData(path, options)` - Execute one-time queries with filters
- `listenToQuery(path, callback, options, errorCallback)` - Real-time query listeners

### Query Options

```typescript
interface QueryOptions {
	orderBy?: string; // Field to order by
	equalTo?: any; // Exact match filter
	limit?: number; // Limit number of results
	startAt?: any; // Start at specific value
	endAt?: any; // End at specific value
}
```

## React Hooks (`hooks/use-realtime-db.ts`)

### 1. `useRealtimeData<T>(path, initialValue?)`

Automatically listens to data changes at a specific path.

```typescript
const { data, loading, error } = useRealtimeData<User>("/users/123");

if (loading) return <div>Loading...</div>;
if (error) return <div>Error: {error.message}</div>;
if (data) return <div>Hello, {data.name}!</div>;
```

### 2. `useRealtimeQuery<T>(path, queryOptions, initialValue?)`

Listens to filtered data in real-time.

```typescript
const { data, loading, error } = useRealtimeQuery<Message[]>("/messages", {
	orderBy: "timestamp",
	limit: 10,
});
```

### 3. `useDatabaseOperations()`

Provides database operation functions with loading states and error handling.

```typescript
const {
	loading,
	error,
	createData,
	readData,
	addToList,
	updateDataFields,
	removeData,
	executeQuery,
	clearError,
} = useDatabaseOperations();

// Create data
await createData("/users/123", { name: "John", email: "john@example.com" });

// Add to list
await addToList("/messages", { text: "Hello!", timestamp: Date.now() });

// Update fields
await updateDataFields("/users/123", { name: "Jane" });

// Delete data
await removeData("/users/123");
```

## Usage Examples

### Basic Data Management

```typescript
import {
	useRealtimeData,
	useDatabaseOperations,
} from "@/hooks/use-realtime-db";

function UserProfile({ userId }: { userId: string }) {
	const { data: user, loading, error } = useRealtimeData(`/users/${userId}`);
	const { updateDataFields } = useDatabaseOperations();

	const handleUpdateName = async (newName: string) => {
		try {
			await updateDataFields(`/users/${userId}`, { name: newName });
		} catch (error) {
			console.error("Failed to update name:", error);
		}
	};

	if (loading) return <div>Loading...</div>;
	if (error) return <div>Error: {error.message}</div>;
	if (!user) return <div>User not found</div>;

	return (
		<div>
			<h1>{user.name}</h1>
			<button onClick={() => handleUpdateName("New Name")}>Update Name</button>
		</div>
	);
}
```

### Real-time List with Filtering

```typescript
function MessageList() {
	const {
		data: messages,
		loading,
		error,
	} = useRealtimeQuery("/messages", {
		orderBy: "timestamp",
		limit: 20,
	});

	if (loading) return <div>Loading messages...</div>;
	if (error) return <div>Error: {error.message}</div>;

	return (
		<div>
			{messages &&
				Object.entries(messages).map(([id, message]) => (
					<div key={id}>
						<strong>{message.author}:</strong> {message.text}
					</div>
				))}
		</div>
	);
}
```

### Complex Queries

```typescript
function RecentPosts() {
	const {
		data: posts,
		loading,
		error,
	} = useRealtimeQuery("/posts", {
		orderBy: "createdAt",
		startAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // Last 7 days
		limit: 10,
	});

	// ... render posts
}
```

## Data Structure Best Practices

### 1. Flatten Your Data

Instead of nested objects, use flat structures with references:

```typescript
// ❌ Avoid deep nesting
{
  "users": {
    "user1": {
      "profile": {
        "name": "John",
        "posts": {
          "post1": { "title": "Hello" }
        }
      }
    }
  }
}

// ✅ Use flat structure with references
{
  "users": {
    "user1": {
      "name": "John",
      "profileId": "profile1"
    }
  },
  "profiles": {
    "profile1": {
      "name": "John",
      "bio": "Developer"
    }
  },
  "posts": {
    "post1": {
      "title": "Hello",
      "authorId": "user1"
    }
  }
}
```

### 2. Use Indexes for Queries

```typescript
// Create an index for efficient queries
{
  "posts": {
    "post1": {
      "title": "Hello",
      "authorId": "user1",
      "createdAt": 1640995200000,
      "category": "tech"
    }
  },
  "posts_by_category": {
    "tech": {
      "post1": true
    }
  },
  "posts_by_author": {
    "user1": {
      "post1": true
    }
  }
}
```

## Security Rules Examples

### Basic Authentication Rules

```json
{
	"rules": {
		".read": "auth != null",
		".write": "auth != null"
	}
}
```

### User-specific Data

```json
{
	"rules": {
		"users": {
			"$uid": {
				".read": "auth != null && auth.uid == $uid",
				".write": "auth != null && auth.uid == $uid"
			}
		}
	}
}
```

### Public Read, Authenticated Write

```json
{
	"rules": {
		"posts": {
			".read": true,
			".write": "auth != null"
		}
	}
}
```

## Performance Tips

1. **Limit Data Retrieval**: Use `limitToFirst()` or `limitToLast()` to avoid loading large datasets
2. **Use Indexes**: Create indexes for fields you frequently query
3. **Avoid Deep Nesting**: Keep data structures flat
4. **Clean Up Listeners**: Always return the unsubscribe function from `useEffect`
5. **Batch Updates**: Use `update()` for multiple field updates instead of multiple `set()` calls

## Error Handling

All functions return consistent error objects:

```typescript
interface Result {
	success: boolean;
	data?: any;
	error?: any;
}
```

The React hooks automatically handle errors and provide loading states for better UX.

## Testing

You can test the real-time functionality by:

1. Opening the example component in multiple browser tabs
2. Adding the component to any page in your app
3. Using the Firebase Console to manually modify data
4. Checking that changes appear in real-time across all connected clients

## Troubleshooting

### Common Issues

1. **Database URL not set**: Make sure `databaseURL` is configured in your Firebase config
2. **Permission denied**: Check your database security rules
3. **Data not updating**: Ensure you're using the correct path and have proper listeners set up
4. **Memory leaks**: Always clean up listeners in `useEffect` return functions

### Debug Mode

Enable debug logging by adding this to your Firebase config:

```typescript
if (process.env.NODE_ENV === "development") {
	// Enable debug logging
	console.log("Firebase Realtime Database initialized");
}
```

## Next Steps

1. Update the `databaseURL` in your Firebase config
2. Set up appropriate security rules in the Firebase Console
3. Start using the hooks in your components
4. Consider implementing offline persistence for better user experience
5. Add data validation and sanitization as needed
