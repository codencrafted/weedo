# **App Name**: Weedo

## Core Features:

- User Authentication: User authentication via name entry: Greet user with personalized dashboard based on name input. Implement local storage to remember the user's name for future sessions. The page route will first ask for the name, then the next page will be the to-do list.
- Add Task: Input form: Add new tasks to the to-do list, with a text input field. If the user is satisfied, they can click next. The to-do list applies for today and tomorrow, and after 12:00 AM, it moves to yesterday.
- To-Do List Display: Dynamic List Display: Display the list of to-do items as they are added, each as a separate item with a checkbox. Use local storage to store these items.
- Complete Task: Mark Complete: Ability to mark each item as complete using a checkbox. Update display to reflect completed tasks (e.g. strike through the text). Add a animation when user completed a task like how google pay add a animtion after payment for user happeniess
- Delete Task: Item Removal: Add button for removing an item from the list.
- Local Storage Integration: Local storage for storing name, tasks, and completion statuses
- Firebase Database: Store data into firebase databse

## Style Guidelines:

- Primary color: White (#FFFFFF) to invoke feelings of organization and calm.
- Background color: Very light gray (#FAFAFA), nearly white.
- Accent color: Pale orange (#FFB37E), providing good contrast and signaling interactivity.
- Font: 'Inter' (sans-serif) for both headings and body, a modern, neutral style suitable for functional UIs
- Minimalist outline icons for actions like add, delete, and mark complete.
- Clean, card-based layout for tasks. Group input and list display in distinct sections.
- Subtle transition animations when adding or completing tasks.