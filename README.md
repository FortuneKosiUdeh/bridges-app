# Bridges — Community Events App

Bridges is a Next.js application designed to connect communities in Lawrence and Andover by providing a centralized platform for local events. It features an interactive map, a calendar view, and detailed event information, making it easy for residents to discover and participate in local activities.

## Features

- **Interactive Map View:** Events are plotted on a Mapbox map, allowing users to see their location.
- **Calendar View:** A traditional calendar interface for browsing events by date.
- **Event Details:** Each event has a dedicated card with detailed information, including flyers.
- **Search and Filtering:** (Future enhancement) Users will be able to search for events and filter by category.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.x or later recommended)
- [npm](https://www.npmjs.com/)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/bridges.git
   cd bridges
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

## Running the Application

1. **Start the development server:**

   ```bash
   npm run dev
   ```

2. **Open your browser:**

   Navigate to [http://localhost:3000](http://localhost:3000) to see the application in action.

## Environment Variables

To use certain features, you will need to create a `.env.local` file in the root of your project and add the following environment variables:

- `NEXT_PUBLIC_MAPBOX_TOKEN`: Your Mapbox access token for displaying maps.
- `OPENAI_API_KEY`: Your OpenAI API key for the translation feature (`/api/translate`).

## Available Scripts

In the project directory, you can run the following scripts:

- `npm run dev`: Runs the app in development mode.
- `npm run build`: Builds the app for production.
- `npm run start`: Starts a production server.
- `npm run geocode:events`: Geocodes event addresses using a script.
- `npm run test:mapbox`: Tests the Mapbox API connection.
- `npm run save:pdfs`: Saves event flyers as PDFs.

## Project Structure

- **/components**: Contains all the React components.
- **/pages**: Contains the Next.js pages and API routes.
- **/public**: Contains static assets like images, flyers, and `events.json`.
- **/scripts**: Contains various Node.js scripts for data processing.
- **/styles**: Contains global CSS styles.

## Deployment

This application is ready to be deployed on [Vercel](https://vercel.com/), the platform from the creators of Next.js.

1. Push your code to a Git repository (e.g., GitHub).
2. Sign up for a Vercel account and import your repository.
3. Set the environment variables in the Vercel dashboard.
4. Vercel will automatically deploy your application on each push to the main branch.

## Key Dependencies

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/api/)
- [React Map GL](https://visgl.github.io/react-map-gl/)
- [OpenAI](https://beta.openai.com/docs/)