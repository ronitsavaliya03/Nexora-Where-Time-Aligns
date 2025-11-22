<h1 align="center" style="color:#00eaff;">NEXORA</h1>
<p align="center">
  <strong>Where Time Aligns</strong><br>
  Designed for Accuracy, Built for Institutions
</p>


---

## ⚠️ PROTOTYPE DISCLAIMER
> This project is currently a Prototype / Proof of Concept. It demonstrates the core logic of constraint-based scheduling using Google OR-Tools. It is not yet a production-ready application and lacks features like authentication, advanced error logging, and multi-user role management.

---

## 📖 Overview

Nexora is an intelligent full-stack academic scheduling application designed to solve the complex "Classroom Scheduling Problem."

Unlike traditional schedulers that rely on static batches, Nexora dynamically generates student groups based on Elective Subject Choices. It ensures that students, faculty, and rooms are never double-booked, while automatically respecting room capacity constraints by "chunking" large student groups into smaller, manageable lab batches.

---

## 🚀 Key Features

- **Dynamic Batch Generation**: Ignores misleading static batch data. Instead, it creates "True Divisions" based on Professional Electives (PE) and "True Batches" based on Open Electives (OE).
- **Smart Capacity Handling**: Automatically splits ("chunks") large student groups into multiple lab sessions if they exceed a room's physical capacity.
- **Constraint Solver**: Utilizes Google OR-Tools (CP-SAT) to mathematically guarantee no conflicts between time slots, rooms, or faculty.
- **Admin Dashboard**: Manual management (CRUD) of Rooms, Subjects, Faculty, and Time Slots.
- **Manual Overrides**: Supports manual creation of batches and student assignment for edge cases.
- **Persistence**: Generated timetables are saved locally so data isn't lost on page refresh.

---

## 🛠️ Tech Stack

### Backend
- **Framework**: .NET 6.0 / 8.0 (Core Web API)
- **Language**: C#
- **Database**: Microsoft SQL Server (MSSQL)
- **ORM**: Entity Framework Core
- **Algorithm Engine**: Google OR-Tools

### Frontend
- **Library**: React.js
- **Styling**: Custom CSS (Modern, Responsive)

---

## 🧠 The Algorithm (How it Works)

The core intelligence lies in the `SchedulingService.cs`. The scheduling process follows a strict logic flow designed to handle Elective complexity:

1. **Input Analysis**: Reads Student Roll Call and Elective Choice CSVs.
2. **Group Formation (The "TT Logic")**:
   - **Divisions (A, B, C...)**: Created by grouping students who share the same Professional Elective.
   - **Batches (A1, A2...)**: Created by sub-grouping divisions based on their Open Elective.
3. **Capacity Check & Chunking**:
   - The system checks the size of every generated batch against the Max Lab Capacity defined in the database.
   - If a batch has 50 students but the lab holds 40, the algorithm automatically splits it into Batch-A1 (Lab 1) and Batch-A1 (Lab 2).
4. **Solving**:
   - The data is passed to the Google CP-SAT solver.
   - Constraints applied: `One_Class_Per_Room`, `One_Class_Per_Faculty`, `One_Class_Per_Student`.
5. **Output**: A conflict-free JSON schedule is returned and saved.

---

## 🔮 Future Roadmap

As this is a prototype, the following features are planned for the full release:

- [ ] Drag-and-drop manual timetable adjustment.
- [ ] User Authentication (Admin vs. Student views).
- [ ] PDF/Excel Export of the generated schedule.
- [ ] Handling "Hard" vs "Soft" constraints (e.g., preferring morning slots).

---

## 📄 License

This project is created for educational/demonstration purposes.

Created by Ronit Savaliya
