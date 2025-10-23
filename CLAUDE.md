# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Agendar Mobile is a React Native Expo application for managing appointments and business operations. The app supports multi-tenant establishments, subscription management, and real-time push notifications via Firebase.

## Development Commands

### Running the App
- `npm start` - Start Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm run web` - Run on web browser

### Code Quality
- `npm run format` - Format code with Biome (auto-fix)
- `npm run check` - Lint and check code with Biome (auto-fix)

### Building
- Use EAS Build for production builds:
  - Development: `eas build --profile development`
  - Preview: `eas build --profile preview`
  - Production: `eas build --profile production`

## Architecture Overview

### Routing (Expo Router v5)
- **File-based routing** in `src/app/` directory
- **Protected routes** using `Stack.Protected` guard based on session state
- **Type-safe navigation** enabled via `experiments.typedRoutes: true`
- Main structure:
  - `login.tsx`, `register.tsx` - Public auth routes
  - `not_subscription.tsx` - Route for users without active subscription
  - `(tabs)/` - Tab-based navigation group with 4 tabs:
    - `index.tsx` - Agenda (appointments calendar)
    - `dashboard.tsx` - Reports/analytics
    - `establishment/` - Business management (services, categories, employees, customers, packages)
    - `settings/` - App configuration

### State Management
- **Authentication**: React Context (`SessionProvider` in `src/providers/auth-context.tsx`)
  - Manages JWT token in secure storage
  - Tracks `session`, `partner`, and `isLoading` state
  - Provides `signIn()` and `signOut()` methods
  - On login: fetches partner data, checks subscription status, routes accordingly
  - On logout: invalidates all React Query caches
- **Server State**: TanStack React Query v5.81.5
  - Singleton `QueryClient` in `src/lib/react-query.ts`
  - All remote data fetched via custom hooks in `src/hooks/data/`
- **Local State**: React hooks for UI state

### API Layer (`src/http/`)
- **Axios client** (`api-client.ts`) with base URL from `EXPO_PUBLIC_API_URL`
- **Request interceptor** automatically adds:
  - `Authorization: Bearer {token}` header
  - `x-establishment-id` header (multi-tenant support)
- **Standardized response pattern**: All API functions return `{ data: T | null, error: string | null }`
- **Error handling**: Centralized via `handleApiError()` in `src/utils/index.ts`
- API functions organized by domain: `auth/`, `category/`, `customers/`, `employees/`, `services/`, `packages/`, `establishment/`, `appointments/`, `reports/`, `subscription/`, etc.

### Data Fetching Pattern
All data operations follow a consistent pattern:

**Queries (read operations)**:
```typescript
// src/hooks/data/category/use-categories.ts
export function useCategories() {
  return useQuery<Category[], string>({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await getCategories()
      if (error) throw error
      return data ?? []
    },
  })
}
```

**Mutations (write operations)**:
```typescript
// src/hooks/data/category/use-create-category.ts
export function useCreateCategory() {
  return useMutation<{ id: string }, string, CreateCategoryRequest>({
    mutationFn: async inputs => {
      const { data, error } = await createCategory(inputs)
      if (error) throw error
      return data!
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
    },
  })
}
```

When adding new data operations:
1. Create API function in `src/http/{domain}/`
2. Create React Query hook in `src/hooks/data/{domain}/`
3. Export from `src/hooks/data/{domain}/index.tsx` if applicable
4. Invalidate related queries in mutation `onSuccess` handlers

### Form Handling
All forms use React Hook Form + Zod validation:

1. **Schema definition** in `src/lib/validations/`
2. **Form component** in `src/components/forms/`
3. Pattern:
```typescript
const form = useForm<Inputs>({
  resolver: zodResolver(schema),
  defaultValues: { ... }
})

return (
  <KeyboardAvoidingView>
    <Controller
      control={form.control}
      name="fieldName"
      render={({ field }) => <Input {...field} />}
    />
    {form.formState.errors.fieldName && (
      <AppText>{form.formState.errors.fieldName.message}</AppText>
    )}
    <AppButton onPress={form.handleSubmit(onSubmit)} />
  </KeyboardAvoidingView>
)
```

### Secure Storage
- Uses `expo-secure-store` on iOS/Android (encrypted)
- Falls back to `localStorage` on web
- Custom hook: `useStorageState()` in `src/hooks/use-storage-state.tsx`
- Stores: `token` (JWT), `establishment-id` (current business)

### Firebase Integration
- Push notifications via `@react-native-firebase/messaging`
- Cloud storage via `@react-native-firebase/storage`
- Background message handler in `src/app/_layout.tsx`
- FCM token saved to backend after login
- Dual configs for dev/prod: `GoogleService-Info{-dev}.plist`, `google-services{-dev}.json`

### Multi-Tenant Architecture
- Each partner can manage multiple establishments
- First establishment ID stored in secure storage on login
- All API requests include `x-establishment-id` header
- Backend filters data by establishment

### Styling
- **NativeWind v4** (Tailwind CSS for React Native)
- **Utility function**: `cn()` in `src/utils/cn.ts` for merging class names with `clsx` and `tailwind-merge`
- **Custom components** in `src/components/`: `Input`, `AppButton`, `Badge`, `ListItem`, `ImagePicker`, etc.

### TypeScript Configuration
- Path alias: `@/*` → `src/*`
- Strict mode enabled
- Expo TypeScript base config

## Important Patterns

### Adding a New Entity (e.g., "Products")
1. **API Layer**:
   - Create `src/http/products/get-products.ts`, `create-product.ts`, etc.
   - Follow standardized `{ data, error }` return pattern
2. **Validation**:
   - Add Zod schema in `src/lib/validations/product.ts`
3. **Data Hooks**:
   - Create `src/hooks/data/products/use-products.ts`, `use-create-product.ts`, etc.
   - Use `queryKey: ["products"]` pattern
   - Invalidate queries in mutations: `queryClient.invalidateQueries({ queryKey: ["products"] })`
4. **Forms**:
   - Create form components in `src/components/forms/`
   - Use `zodResolver` with schema
   - Use `Controller` from `react-hook-form` for inputs
5. **Routes**:
   - Add route in `src/app/(tabs)/establishment/products/`
   - Create `index.tsx` (list), `new.tsx` (create), `[id].tsx` (edit)
   - Add `_layout.tsx` for nested navigation if needed

### Environment Variables
- All public env vars must be prefixed with `EXPO_PUBLIC_`
- Access via `process.env.EXPO_PUBLIC_VAR_NAME`
- Key variables:
  - `EXPO_PUBLIC_API_URL` - Backend API endpoint
  - `EXPO_PUBLIC_APP_VARIANT` - "production" or "development"

### Subscription Status Handling
- Partner object includes `subscriptions` array
- Check `subscriptions[0].status === "active"` for access control
- Route to `/not_subscription` if inactive
- Status enum in `src/lib/enums.ts`

### Image Uploads
- Use `uploadImage()` helper from `src/lib/upload-image.ts`
- Uploads to Firebase Storage
- Returns public URL for backend storage

## Code Quality Standards

### Biome Configuration
- **Formatter**: 2-space indents, 80-char line width, semicolons as-needed, ES5 trailing commas
- **Linter**: Recommended rules enabled with exceptions:
  - `useExhaustiveDependencies: off` (due to React Native patterns)
  - `useHookAtTopLevel: off`
  - `useValidAnchor: off`
  - `noNonNullAssertion: off`

### Conventions
- Use arrow functions with "as needed" parentheses
- Double quotes for JSX, single quotes elsewhere (Biome auto-formats)
- TypeScript strict mode enabled
- Zod schemas for all API payloads and form inputs
- All API functions return `{ data, error }` tuple

## Testing & Building

### Development Workflow
1. Run `npm start` to start Expo dev server
2. Press `a` for Android, `i` for iOS, `w` for web
3. Use `npm run check` before committing to catch issues

### Building for Production
- EAS Build configured in `eas.json`
- Production builds use `EXPO_PUBLIC_APP_VARIANT=production`
- Separate Firebase configs for dev/prod environments
- Bundle identifiers: `br.tec.agendar` (prod), `br.tec.agendar.dev` (dev)

## Common Gotchas

### KeyboardAvoidingView
- Always wrap forms in `KeyboardAvoidingView` with `behavior="padding"` on iOS
- Set `keyboardVerticalOffset` to account for headers
- Use `ScrollView` inside for long forms

### React Query Cache Invalidation
- Always invalidate related queries after mutations
- Example: After creating a category, invalidate `["categories"]`
- On logout, all queries are invalidated automatically

### Secure Storage on Web
- Falls back to localStorage (not encrypted)
- Don't store highly sensitive data if web support is critical

### Firebase Permissions
- Android: `POST_NOTIFICATIONS` permission requested on app start
- iOS: Permissions configured in `GoogleService-Info.plist`

## File Structure Reference

```
src/
├── app/                    # Expo Router routes
│   ├── (tabs)/            # Tab navigation group
│   ├── _layout.tsx        # Root layout (providers, navigation)
│   ├── login.tsx
│   └── register.tsx
├── components/            # Reusable UI components
│   ├── forms/            # Form components (12+)
│   └── reports/          # Dashboard cards
├── hooks/
│   ├── use-storage-state.tsx
│   └── data/             # React Query hooks by domain
├── http/                 # API client functions (39+ files)
│   └── api-client.ts     # Axios configuration
├── lib/
│   ├── react-query.ts    # QueryClient setup
│   ├── enums.ts          # Shared enums
│   ├── upload-image.ts   # Firebase storage helper
│   └── validations/      # Zod schemas (12+ files)
├── providers/
│   └── auth-context.tsx  # SessionProvider
└── utils/
    ├── cn.ts             # Tailwind class merging
    └── index.ts          # Helper utilities
```
