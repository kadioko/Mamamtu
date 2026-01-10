# MamaMtu – Project Overview (Plain Language)

## 1. What is MamaMtu?

MamaMtu is a digital helper for clinics that care for pregnant women and newborn babies.

Instead of using only paper files and memory, MamaMtu gives the clinic a single place to:
- See which mothers and babies they are looking after.
- Book and follow up on clinic visits (appointments).
- View key health information and notes.
- Spot who might need urgent attention.

You can think of it as a simple control centre for a maternal and newborn clinic.

## 2. Why are we building it?

Many clinics are very busy and still rely heavily on paper, WhatsApp chats, and people
remembering things. This makes it easy to:
- Miss important follow‑up visits.
- Lose track of who is high‑risk or needs special attention.
- Have information scattered in different places.

We are building MamaMtu to:
- Help nurses, doctors, receptionists and clinic managers see the full picture in one place.
- Reduce missed appointments and late follow‑ups for pregnant women and newborns.
- Make it easier to record basic health information and find it later.
- Support better planning and decision‑making in maternal and newborn care.

In simple terms: **we want fewer mothers and babies to slip through the cracks.**

## 3. Who is it for?

- **Mothers and newborn babies** – so their care is better organised and easier to follow.
- **Healthcare workers** (nurses, doctors, midwives, clinical officers) – so they can quickly
  see who they are caring for and what needs to be done today.
- **Reception/admin staff** – so booking, rescheduling and cancelling appointments is clearer.
- **Clinic managers** – so they can see key numbers at a glance (how many active patients,
  how many appointments, how many pregnancies, etc.).

## 4. What can the system do so far?

Based on the current code and screens, the project is already a **working prototype** with
several core features in place.

### 4.1. Accounts and sign‑in

- Users can **register, sign in and sign out**.
- There is a **“forgot password”** flow that sends a reset link by email.
- The system supports different **user roles** (for example: admin, healthcare provider,
  patient, receptionist) so we can later control who sees what.

### 4.2. Main dashboard

There is a main **clinic dashboard** that shows high‑level numbers, for example:
- How many **active patients**.
- How many **upcoming appointments**.
- How many **active pregnancies**.
- How many **alerts** that may need attention.

The dashboard also shows a list of **recent appointments** and offers **quick actions**,
so a staff member can jump straight into common tasks.

### 4.3. Appointments (booking and managing visits)

The appointments area is quite advanced:
- A main **appointments page** where staff can:
  - See **upcoming appointments**.
  - See **today’s appointments**.
  - View appointments on a **calendar view**.
- A **“New appointment”** page where staff can:
  - Pick a patient.
  - Choose date and time.
  - Fill in basic details for the visit.
- An **appointment details page** for each appointment, where staff can:
  - View all details for that visit.
  - Change the **status** (for example, scheduled, in progress, completed, cancelled).
  - **Delete** an appointment when needed.

Behind the scenes there is a proper **database structure** for appointments, patients and
medical records, not just front‑end mockups.

### 4.4. Patients and medical records

There is a **patient details page** that shows:
- Basic information about the patient (name, contact details, address, emergency contact,
  insurance, notes, etc.).
- Tabs for:
  - **Overview**.
  - **Medical records**.
  - **Appointments**.
  - **Vitals** (like blood pressure, weight, etc.).

Right now, parts of this screen still use **example (mock) data**, but the layout and data
model are in place. There is also a database model for:
- **Medical records** (reason for visit, diagnosis, treatment, lab results, attachments, etc.).
- The link between **medical records and appointments**.

Some UI components exist for **viewing and adding medical records**, which means this part of
the system is started but still needs more wiring to real data and workflows.

### 4.5. Education content (learning materials)

The project includes an **education section** for health content. From the code and database
we can see:
- A structure for **categories** (for example, topics like pregnancy, newborn care, nutrition).
- A content model that supports **articles, videos, PDFs, quizzes and more**.
- Fields for things like difficulty level, tags, view counts and ratings.

This gives us a solid base to store and show **health education materials** for mothers and
for healthcare workers. The main work left here is adding real content and polishing the
user experience.

### 4.6. Tests and technical foundations

- There are **automated tests** for key flows such as appointments and the dashboard.
- The app uses **Next.js, TypeScript and a modern UI library**, which is a solid, scalable
  technical foundation.
- The database is managed through **Prisma**, which makes it easier to evolve the data model
  over time.

Overall, the project is beyond a bare skeleton; it is a **functioning early version** that can
already be demoed.

## 5. How far along are we?

In simple terms: **we have a working prototype with core pieces in place**, but it is **not
yet a fully finished product for everyday clinic use**.

Roughly:
- **Core flows in place:**
  - Sign‑up, sign‑in and password reset.
  - Dashboard with live metrics and recent appointments.
  - Appointment list, calendar view, creation and detail pages.
  - Patient detail layout, including space for medical records, appointments and vitals.
  - Database models for patients, users, appointments, medical records and education content.
- **Quality and reliability:**
  - Some tests exist, and error states/loading states are handled in many places.
  - The UI is responsive and mobile‑friendly.

We are now in a stage where the system “works” for demos and internal use, but still needs
more **real data, polishing and safety checks** before it can be trusted in a real clinic
without supervision.

## 6. What is left to do?

Below is a high‑level view of the remaining work, written in plain language.

### 6.1. Connect everything fully to real data

- Replace any remaining **dummy or mock data** (for example, some patient details screens)
  with real data from the database.
- Make sure **patient history, vitals and appointments** all line up correctly and show the
  same person’s journey.
- Ensure that actions taken in the UI (like updating an appointment status or adding a
  medical record) are always **saved correctly** and reflected everywhere.

### 6.2. Finish and polish patient and record workflows

- Complete the **medical records** workflow:
  - Make it easy to add new visit notes, diagnoses, lab results and treatments.
  - Make it easy to view a patient’s past visits in a clear timeline.
- Wire up and improve the **vitals** section so it shows meaningful trends over time
  (e.g. blood pressure and weight during pregnancy).
- Improve the **appointment history** section inside the patient page so staff can see all
  visits for that person in one place.

### 6.3. Strengthen roles, security and safety

- Tighten **who can see what**, for example:
  - Patients should only see their own information.
  - Staff should only see data for their clinic or their role.
- Review and improve **error messages** so they are clear and helpful without exposing
  sensitive details.
- Prepare for **production deployment** with proper backups, logging and monitoring so
  problems can be detected and fixed quickly.

### 6.4. Education content and user experience

- Add **real health education content** (articles, videos, etc.) that is correct, local
  and easy to understand.
- Organise the content into **clear categories** (for example: pregnancy by trimester,
  danger signs, newborn care, breastfeeding, family planning).
- Improve the way users **search and browse** the education content so they can find what
  they need quickly.

### 6.5. Notifications and follow‑up (future direction)

Some ideas for future improvements include:
- **Reminders** for upcoming appointments by email, SMS or WhatsApp.
- **Alerts** for high‑risk cases or missed visits.
- Simple **reports** to show trends over time (for example, number of active pregnancies,
  no‑shows, high‑risk cases).

These features would make the system even more useful for day‑to‑day follow‑up.

## 7. Summary

- MamaMtu is a **clinic support tool** focused on pregnant women and newborn babies.
- It already has a **working dashboard, appointment system, basic patient views and a data
  model** for medical records and education content.
- We are currently at a **working prototype** stage: good enough for demos and internal
  trials, but not yet finished for unsupervised use in real clinics.
- The remaining work is mainly about **connecting everything to real data, polishing the
  user experience, tightening security and adding real content and notifications**.

This document is meant to explain the project in simple language so that both technical and
non‑technical people can quickly understand what MamaMtu is and where we are in the journey.
