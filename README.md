# WordSprout

**WordSprout** is a bilingual/trilingual vocabulary tracker for babies and young children. It allows parents to add, monitor, and track the progress of their child's vocabulary growth separately across multiple languages (English, Spanish, and Portuguese). It focuses not just on learning but on true language production (saying the word).

---

## Features

- User authentication (login/logout)
- Add new vocabulary words in English, Spanish, and/or Portuguese
- Track per-language vocabulary development
- Update language learning status individually (Learning, Recognizes, Says)
- Visual progress bars based on words **spoken**, not just added
- Clean, baby-friendly dashboard interface
- MongoDB backend for data persistence

---

## Technologies Used

- Node.js
- Express.js
- EJS templates
- MongoDB (native driver)
- Vanilla CSS (with Nunito font)

---

## Getting Started

### Prerequisites
- Node.js and npm installed
- MongoDB Atlas account or local MongoDB instance

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/wordsprout.git

# Move into the project directory
cd wordsprout

# Install dependencies
npm install
```

### Environment Variables
Create a `.env` file at the root of your project:

```
MONGO_URI=your_mongodb_connection_string
SESSION_SECRET=your_session_secret
```

---

## Running the App

```bash
npm run dev
```

The app will be running on:
```
http://localhost:3000
```

---

## Main Routes

| Method | Route                  | Purpose                                |
|--------|-------------------------|----------------------------------------|
| GET    | `/login`                | Show login page                        |
| POST   | `/login`                | Login user                             |
| POST   | `/logout`               | Logout user                            |
| GET    | `/profile`              | Show dashboard with word progress      |
| POST   | `/words`                | Plant (add) a new word                 |
| POST   | `/words/:id`            | Update word's per-language status      |
| POST   | `/words/:id/delete`     | Delete a word (optional future)        |

---

## Future Improvements

- Add flash messages for feedback ("Word updated!", "Logged out!")
- Add word categories and filtering (e.g., Animals, Colors)
- Add support for audio (baby saying words)
- Progress gamification (badges for milestones)
- Responsive mobile-first redesign

---

## License

This project is licensed under the MIT License.

---

## Acknowledgments

Created with love for families raising bilingual and trilingual children. 🌟

---

## Author

[Jorge Garcia](https://github.com/jorge0510)

