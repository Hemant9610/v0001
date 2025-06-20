# Supabase Email Authentication with React

This project demonstrates how to implement email authentication using Supabase in a React application with TypeScript.

## Features

- Email/Password Authentication
- User Registration
- User Login
- Protected Routes
- User Profile Display
- Session Management
- Responsive Design with Tailwind CSS

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a Supabase project at [supabase.com](https://supabase.com)

4. Copy your Supabase URL and anon key to the `.env` file:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Project Structure

```
src/
├── components/
│   ├── Auth.tsx          # Authentication component
│   ├── Dashboard.tsx     # Protected dashboard component
│   └── ui/              # UI components
├── contexts/
│   └── AuthContext.tsx  # Authentication context
├── lib/
│   └── supabase.ts      # Supabase client configuration
└── App.tsx              # Main application component
```

## Authentication Flow

1. **Sign Up**: Users can create an account with email and password
2. **Email Confirmation**: Users receive a confirmation email (if enabled in Supabase)
3. **Sign In**: Users can log in with their credentials
4. **Protected Content**: Authenticated users can access the dashboard
5. **Sign Out**: Users can log out and return to the auth screen

## Technologies Used

- React 18
- TypeScript
- Supabase
- Tailwind CSS
- Vite
- shadcn/ui components

## Supabase Configuration

Make sure to configure your Supabase project:

1. Enable email authentication in your Supabase dashboard
2. Configure email templates (optional)
3. Set up any additional authentication providers if needed

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is open source and available under the [MIT License](LICENSE).