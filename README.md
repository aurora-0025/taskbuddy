# Task Management App

## 🚀 Overview
This is a task management application built using React, TypeScript, and Firebase. It allows users to manage their tasks efficiently with features like authentication, categorization, drag-and-drop reordering, and a Kanban board view.

## ✅ Features Checklist

### 🔐 User Authentication
- [x] Firebase Authentication with Google Sign-In
- [x] User profile management

### 📋 Task Management
- [x] Create, edit, and delete tasks
- [x] Task categorization (Work, Personal, etc.)
- [x] Task tagging
- [x] Set due dates for tasks
- [x] Drag-and-drop to rearrange tasks
- [x] Sort tasks based on due dates (ascending/descending)

### 📌 Batch Actions
- [x] Delete multiple tasks at once
- [x] Mark multiple tasks as complete

### 📝 Task History and Activity Log
- [ ] Track task changes (creation, edits, deletions)
- [ ] Display activity log for each task

### 📎 File Attachments
- [ ] Attach files/documents to tasks
- [ ] File upload feature in task form
- [ ] Display attached files in task details

### 🔍 Filter Options
- [x] Filter tasks by tags, category, and date range
- [x] Search tasks by title

### 📌 Board/List View
- [x] Toggle between Kanban board view and list view

### 📱 Responsive Design
- [x] Mobile-first approach
- [x] Adapts to various screen sizes (mobile, tablet, desktop)

## 🛠️ Technical Requirements
- [x] Built with **React** and **TypeScript**
- [x] Uses **Firebase** for authentication and data storage
- [x] Utilizes **React Query** for data fetching and state management

## 🏗️ Challenges Faced & Solutions

### 🔄 Drag-and-Drop Implementation
**Challenge:** Finding a robust drag-and-drop library that supports reordering and status updates.
**Solution:** Implemented **dnd-kit**, which provides flexibility and better performance.

### 🎨 Using shadcn with React 19
**Challenge:** Shadcn did not fully support React 19 at the time of development.
**Solution:** Used the **canary version** of shadcn/ui, which includes updates compatible with React 19.

### 📦 Learning React Query
**Challenge:** Understanding caching, optimistic updates, and mutations.
**Solution:** Followed official documentation and hands-on experimentation to master data fetching and state management.

## 🚀 Deployment
The application is live and accessible at:

[🔗 Live Demo]()

## 📜 Installation & Running the Project

```bash
# Clone the repository
git clone https://github.com/your-repo-url.git
cd your-repo-folder

# Install dependencies
npm install

# Start the development server
npm run dev
```