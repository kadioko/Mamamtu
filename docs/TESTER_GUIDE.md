# MamaMtu — Tester Guide

**Thank you for testing MamaMtu.**

This guide gives you everything you need to explore the platform thoroughly and leave feedback that helps us improve. Please read it before you start — it will save you time and help you find the most interesting parts of the system.

---

## What Is MamaMtu?

MamaMtu is a digital health platform for clinics and hospitals managing maternal and newborn care in Tanzania. It helps clinical staff:

- Register and track pregnant patients across their full care journey
- Schedule and record antenatal care (ANC) visits
- Flag high-risk pregnancies automatically
- Track newborn records and immunizations
- Generate reports and export data securely
- Receive and manage appointment notifications

---

## How to Log In

Go to the app and sign in at `/auth/signin`.

**All test accounts use the same password:**

```text
Demo2025!
```

| Account | Email | Role | What it's for |
| --- | --- | --- | --- |
| **Administrator** | `admin@mama-tu.health` | Admin | Full access to everything |
| **Doctor (primary)** | `provider@mama-tu.health` | Healthcare Provider | Clinical workflows, patient care |
| **Doctor (secondary)** | `provider2@mama-tu.health` | Healthcare Provider | Same as above, second doctor |
| **Receptionist** | `reception@mama-tu.health` | Receptionist | Front-desk tasks, appointments, patients |

**We recommend starting with the Admin account** to see the full picture, then switching to a Provider or Receptionist to experience how different staff roles see the system differently.

---

## What Each Role Can Do

Different staff see different menu items and have different permissions. This is intentional — it mirrors how real clinics work.

### Administrator (`admin@mama-tu.health`)

Full access to everything. Use this account to explore the whole system.

| Area | Can do |
| --- | --- |
| Dashboard Overview | View clinic-wide stats and activity |
| Patients | View, add, edit, search all patients |
| Appointments | View, schedule, manage all appointments |
| Medical Records | View and manage all records |
| Vitals | View patient vitals |
| Pregnancies | View, create, edit all pregnancy episodes |
| ANC Visits | View, create, edit all antenatal visits |
| Newborns | View, create, edit newborn records |
| Immunizations | View, create, edit immunization records |
| Reports | Download exports (patients, appointments, records) and view export history |
| Education | Manage health education content (publish/unpublish) |
| **Audit Log** | See a full log of who accessed or changed what — Admin only |
| **Staff Users** | Create and manage staff accounts — Admin only |
| **Production** | System health dashboard — Admin only |
| Notifications | View and manage notifications |
| Settings | Account and system settings |

### Healthcare Provider (`provider@mama-tu.health` or `provider2@mama-tu.health`)

Full clinical access. Cannot manage staff or see the audit log.

| Area | Can do |
| --- | --- |
| Dashboard Overview | ✅ |
| Patients | ✅ View, add, edit |
| Appointments | ✅ |
| Medical Records | ✅ View and manage |
| Vitals | ✅ |
| Pregnancies | ✅ |
| ANC Visits | ✅ |
| Newborns | ✅ |
| Immunizations | ✅ |
| Reports | ✅ Download exports |
| Education | ✅ View (no publish control) |
| Audit Log | ❌ Admin only |
| Staff Users | ❌ Admin only |
| Production | ❌ Admin only |
| Notifications | ✅ |
| Settings | ✅ |

### Receptionist (`reception@mama-tu.health`)

Front-desk access. Can see patients and appointments but not clinical records.

| Area | Can do |
| --- | --- |
| Dashboard Overview | ✅ |
| Patients | ✅ View and register patients |
| Appointments | ✅ Schedule and manage |
| Medical Records | ❌ Clinical staff only |
| Vitals | ❌ |
| Pregnancies | ❌ |
| ANC Visits | ❌ |
| Newborns | ❌ |
| Immunizations | ❌ |
| Reports | ❌ |
| Education | ✅ View |
| Audit Log | ❌ |
| Staff Users | ❌ |
| Notifications | ✅ |
| Settings | ✅ |

---

## Pre-Loaded Demo Patients

The system has real-feeling demo patient records ready to explore. You do not need to create anything from scratch.

| Patient ID | Scenario | What to explore |
| --- | --- | --- |
| `DEMO-0001` | High-risk active pregnancy | Risk flagging, ANC visit history, pregnancy timeline |
| `DEMO-0002` | Teen first pregnancy with anaemia support | Sensitive case handling, ANC scheduling |
| `DEMO-0003` | Postpartum and newborn follow-up | Newborn record, postnatal workflow |
| `DEMO-0004` | Gestational diabetes monitoring | Ongoing visit tracking, medical records |
| `DEMO-0005` | Missed ANC outreach | Missed appointment workflow, notifications |
| `DEMO-0006` | Newborn immunization tracking | Immunization schedule, baby records |

Search for these patients in **Patients → Search** or browse directly from the sidebar.

---

## Things Worth Testing

Here are the key areas we'd love your feedback on:

### 1. Patient Registration & Search

- Register a new patient (Patients → New Patient)
- Search by name, ID, or phone number
- Open a patient profile and view their timeline

### 2. Pregnancy & ANC Workflow

- Open `DEMO-0001` — view the high-risk pregnancy
- Add an ANC visit (Pregnancies → select episode → Add Visit)
- Check that the timeline updates

### 3. Appointments

- Schedule a new appointment
- Change an appointment status (confirm, cancel, complete)
- View the calendar view

### 4. Newborns & Immunizations

- Open `DEMO-0003` — view the newborn record linked to the mother
- Browse immunization records for `DEMO-0006`
- Add a new immunization

### 5. Reports & Exports (Admin / Provider only)

- Go to Reports in the sidebar
- Download a patient list export (CSV or PDF)
- Check the Export History — every download is logged for compliance

### 6. Audit Log (Admin only)

- Go to Audit Log
- See who has accessed or changed what, and when
- This is the compliance trail for the clinic

### 7. Education Resources

- Go to Education from the sidebar
- Browse and open health articles
- As Admin, try publishing or unpublishing a resource

### 8. Notifications

- Bell icon (top right) shows live notifications
- Go to Notifications in the sidebar for the full list
- Mark notifications as read

### 9. Role Switching

- Log out and log back in as a different role
- Notice which menu items appear or disappear
- Try accessing `/dashboard/audit` as a Receptionist — you should be blocked

### 10. Mobile / Tablet View

- Resize your browser or test on a phone/tablet
- The system is designed for clinic devices, including tablets with limited screen space

---

## What Good Feedback Looks Like

When you leave a review or send feedback, these are the things that help us most:

| Question | Why it matters |
| --- | --- |
| Was it clear what each screen was for? | Helps us improve labels and layout |
| Did anything confuse you or slow you down? | Reveals friction in real workflows |
| Did role permissions feel right? | Confirms staff access is correct for clinical use |
| Did the system feel fast enough? | Helps us prioritize performance work |
| Were there any errors or broken pages? | Catches bugs before real patients are entered |
| What one thing would you add or change? | Guides our next features |

You can send feedback to: **<gmariki@necuva.com>** or WhatsApp **+255743910580**

---

## Frequently Asked Questions

**Q: Is this real patient data?**
No. All patient records are demo data created for testing. No real patient information is stored.

**Q: Can I break anything?**
No. Feel free to create, edit, and explore freely. Nothing you do will affect any other tester's experience.

**Q: What if I get an error or something looks wrong?**
Please note the page you were on, what you did, and what happened, then send it to us. Screenshots are very helpful.

**Q: Can I register my own account?**
Yes — go to `/auth/register`. However, new accounts start inactive and need admin approval to log in. Use the test accounts above for immediate access.

**Q: What does "ANC" mean?**
Antenatal Care — the routine health check-ups a pregnant woman receives before delivery. It is the core clinical workflow MamaMtu is built around.

---

## Thank You

Your feedback directly shapes how MamaMtu develops. The clinics and mothers we serve depend on this platform being clear, reliable, and easy to use — and that only happens through careful testing like yours.

We appreciate your time.

---

*MamaMtu by Necuva Group Limited | <gmariki@necuva.com> | +255743910580*
