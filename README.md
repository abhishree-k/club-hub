<div align="center">

# 🎓 DSCE Clubs  
### Centralized Club Management Platform

<p align="center">
A modern, lightweight, and open-source web platform for managing clubs, events, and campus communication.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Open%20Source-SWoC%202026-success?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Beginner%20Friendly-Yes-blue?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Frontend-HTML%20%7C%20CSS%20%7C%20JS-orange?style=for-the-badge"/>
</p>

</div>

---

## 📖 About The Project

**DSCE Clubs** is a centralized, web-based platform designed to simplify **club management, event coordination, and campus communication** within educational institutions.

It offers a **single, unified interface** for students, club leads, and faculty administrators—ensuring transparency, accessibility, and smooth coordination of campus activities.

---

## ❗ Problem Statement

Educational institutions often face:

- Fragmented club information across multiple platforms  
- Inefficient event registration workflows  
- Missed announcements and poor reach  
- Lack of centralized faculty oversight  

### ✅ Solution

**DSCE Clubs** brings all club-related activities under **one structured, accessible, and transparent system**.

---

## ✨ Key Features

<details>
<summary><strong>👩‍🎓 Student Module</strong></summary>

- Browse and explore clubs  
- View upcoming and past events  
- Register for events seamlessly  
- Receive announcements and updates  

</details>

<details>
<summary><strong>🧑‍💼 Club Admin / Lead Module</strong></summary>

- Manage club members  
- Create, update, and manage events  
- Publish announcements and notices  
- Maintain club records  

</details>

<details>
<summary><strong>👨‍🏫 Faculty / Super Admin Module</strong></summary>

- Oversee all clubs and activities  
- Review and approve events  
- Coordinate campus-wide initiatives  
- Ensure transparency and compliance  

</details>

---

## 🖼️ Screenshots

> 📌 Upload screenshots inside: `assets/screenshots/`

| Home | Events | Admin |
|------|--------|-------|
| ![](assets/screenshots/home.png) | ![](assets/screenshots/events.png) | ![](assets/screenshots/admin-dashboard.png) |

---

## 🛠 Tech Stack

| Category | Technologies |
|--------|-------------|
| Frontend | HTML5, CSS3 |
| Scripting | Vanilla JavaScript |
| Backend | Node.js, Express |
| Database | SQLite, Sequelize |
| Styling | Custom CSS |
| Version Control | Git & GitHub |

> 🎯 Designed to be **lightweight, fast, and beginner-friendly**.

---

## 📁 Project Structure

```bash
club-hub/
├── assets/
│   └── screenshots/
├── index.html
├── events.html
├── past-events.html
├── registration.html
├── admin-login.html
├── admin.css
├── admin.js
├── app.js
├── style.css
├── README.md
└── CONTRIBUTING.md
```
---

## ⚙️ Getting Started
### Prerequisites
- Modern web browser (Chrome, Firefox, Edge, Safari)
- No backend or database required

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/<your-username>/club-hub.git
   cd club-hub
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env if needed
   node server.js
   ```

3. **Create Admin User**
   ```bash
   # Usage: node add_admin.js <email> <password> [firstName] [lastName]
   node add_admin.js super@admin.com securepass123 "Top" "Secret"
   ```

3. **Run Frontend**
   - Open `index.html` in your browser
   - (Optional) Use Live Server for better experience

---

## 🧪 Usage Guide 
- Navigate through the UI as a student
- Explore clubs & events
- Access admin functionality
- Extend features by modifying JS/CSS

 ---

## 🤝 Contributing

We welcome contributions from all experience levels 💙


📌 Please read **CONTRIBUTING.md** before contributing.

## 🧑‍🤝‍🧑 Contributors

Thanks to all the amazing people who have contributed to **DSCE Clubs** 💙

<a href="https://github.com/abhishree-k/club-hub/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=abhishree-k/club-hub" />
</a>

Want to see you here?  
Check out the **Contributing Guide** and start contributing 🚀


### Contribution Flow
```bash
git checkout -b feature/your-feature
git commit -m "feat: meaningful description"
git push origin feature/your-feature
```
Open a Pull Request 🚀

--- 
## 🗺 Roadmap

- Backend integration
- Role-based authentication
- Analytics dashboard
- Mobile responsiveness
- Accessibility improvements
 ---

## 🏷 Open Source Program
## #🌱 Social Winter of Code (SWoC) 2026

This project encourages:
- Beginner-friendly issues
- UI/UX improvements
- Documentation contributions
- Feature proposals

--- 

## 📄 License
Licensed under the repository’s license.
All contributions follow the same terms.

--- 

## 🙌 Acknowledgements
- SWoC 2026 mentors & maintainers
- Open-source contributors
- Student developer community

--- 

<div align="center">
⭐ If you like this project, don’t forget to star the repository!

Happy Contributing 🚀
</div> 
