# Tanzania Compliance & Privacy Documentation

**Purpose:** Templates and checklists for Tanzania data protection, patient consent, and clinical safety compliance before pilot launch.

**Last Updated:** 2026-05-25

---

## 1. Privacy Notice (Patient-Facing)

### English Version Template

```
MamaMtu Health Records Privacy Notice

1. WHO WE ARE
MamaMtu is a digital health record system operated by Necuva Group Limited, 
a registered Private Limited Company in Tanzania. We help clinics and hospitals manage 
maternal and newborn health records securely.

2. WHAT DATA WE COLLECT
- Personal: Name, date of birth, phone number, address
- Health: Pregnancy records, ANC visits, delivery details, newborn information, 
  medical history
- Contact: Next of kin details for emergencies

3. WHY WE COLLECT IT
- To track maternal health progress
- To remind you of appointments
- To help healthcare providers give better care
- To report anonymized health statistics to the Ministry of Health

4. WHO CAN SEE YOUR DATA
- Your healthcare providers at this facility
- Authorized clinic administrators
- YOU - you can request to see your records

We DO NOT:
- Sell your data to anyone
- Share with insurance companies without your consent
- Allow unauthorized staff to access your records

5. HOW WE PROTECT IT
- Encrypted storage ( scrambled so only authorized people can read)
- Password-protected access
- Audit logs (we track who looks at what)
- Secure cloud servers with backups

6. YOUR RIGHTS
- Right to see your records
- Right to correct mistakes
- Right to ask questions about your data
- Right to complain if something goes wrong

7. HOW LONG WE KEEP IT
- Active pregnancy records: Until 2 years after delivery
- Then archived for 7 years (legal requirement)
- Then permanently deleted

8. CONTACT US
Data Protection Officer: Godfrey Mariki
Email: privacy@necuva.com
Phone: +255743910580
Clinic Contact: [Clinic phone - add when pilot secured]

Date: [Insert date]
Version: 1.0
```

### Swahili Version (Key Points)

```
TAARIFA YA FARAGHA YA MAMA MTU

1. SISI NI NANI
MamaMtu ni mfumo wa kuhifathi rekodi za afya unaotumika na Necuva Group Limited.

2. TUNAKUSANYA NINI
- Jina, tarehe ya kuzaliwa, namba ya simu, anwani
- Rekodi za ujauzito, matibabu, kujifungua, mtoto mchanga
- Maelezo ya ndugu wa karibu wa dharura

3. TUNAITUMIAJE
- Kufuatilia maendeleo ya afya ya mama
- Kukukumbusha miadi
- Kusaidia watoa huduma kukupa matibabu bora
- Kuandika ripoti za takwimu kwa Wizara ya Afya (bila majina)

4. HAKI ZAKO
- Haki ya kuona rekodi zako
- Haki ya kutatua makosa
- Haki ya kuuliza maswali

Mawasiliano: privacy@necuva.com
```

---

## 2. Patient Consent Form Template

```
MAMA MTU - IDHINI YA MTEJA
(Patient Consent Form)

Jina la Mteja / Patient Name: _________________________
Namba ya Uambatisho / Patient ID: _________________________
Tarehe / Date: _________________________

NAKUBALI / I CONSENT TO:

□ 1. Rekodi zangu za afya kuhifathiwa kwenye mfumo wa MamaMtu
    (My health records being stored in the MamaMtu system)

□ 2. Watoa huduma wa kliniki yangu kuona na kuandika kwenye rekodi zangu
    (Clinic healthcare providers viewing and updating my records)

□ 3. Kukumbushwa kwa miadi kupitia SMS/WhatsApp kwenda namba yangu
    (Appointment reminders via SMS/WhatsApp to my phone)

□ 4. Ripoti za takwimu kutoanwa bila majina yangu
    (Anonymous statistics being reported for health planning)

NAFAHAMU / I UNDERSTAND THAT:

□ - Ninaweza kuuliza maswali kabla ya kuidhinisha
  (I can ask questions before consenting)

□ - Ninaweza kufuta idhini yangu wakati wowote kwa kuandika barua
  (I can withdraw consent anytime by writing)

□ - Taarifa zangu zinalindwa kwa siri
  (My information is kept confidential)

Saini ya Mteja / Patient Signature: _________________
Saini ya Shahidi / Witness Signature: _________________
Jina la Shahidi / Witness Name: _________________

---

FOR CLINIC USE ONLY:

Staff ID who explained consent: _________________
Staff Signature: _________________
Date entered into system: _________________
Consent version: v1.0 (May 2026)
```

---

## 3. Data Retention Policy

```
MAMA MTU DATA RETENTION POLICY
Effective Date: [Insert date]
Location: Tanzania

1. ACTIVE RECORDS
- Pregnancy records: Active from first ANC visit through 2 years post-delivery
- Postpartum records: Active for 2 years after delivery date
- Pediatric records: Active until child reaches 5 years old

2. ARCHIVE PERIOD
After active period ends:
- Records moved to encrypted archive
- Access restricted to senior medical staff
- Retained for 7 years (Tanzania legal requirement for medical records)

3. DESTRUCTION
After 7-year archive:
- Records permanently deleted from all systems
- Backup copies also purged
- Certificate of destruction generated
- Patient notified upon request

4. EXCEPTIONS
- Legal proceedings: Retain until case resolution + 2 years
- Research studies: Anonymized data may be retained longer with ethics approval
- Death during care: Retain for 15 years (medico-legal requirement)

5. PATIENT-INITIATED DELETION
Patients may request early deletion:
- Requires written request
- Medical director approval
- Legal review if complications occurred
- 30-day processing period
```

---

## 4. Data Breach Response Plan

```
MAMA MTU BREACH RESPONSE PLAN
72-Hour Notification Requirement (Tanzania Data Protection Act 2022)

PHASE 1: DETECTION (0-2 hours)
□ Alert triggered (unusual access pattern, failed auth spike, etc.)
□ Incident commander assigned (rotating: CTO → Lead Dev → Security lead)
□ Initial assessment: What data? How many patients? How accessed?
□ Containment: Lock affected accounts, revoke suspicious sessions

PHASE 2: INVESTIGATION (2-24 hours)
□ Technical forensics: Review logs, identify attack vector
□ Scope confirmation: Exactly which patient records affected
□ Preserve evidence: Screenshots, logs, timestamps
□ Engage legal counsel if needed

PHASE 3: NOTIFICATION (24-72 hours)
□ Notify Tanzania Data Protection Commissioner:
  - Email: [contact from www.odpc.go.tz]
  - Phone: [commissioner hotline]
  - Form: Data breach notification form

□ Notify affected patients:
  - SMS: "Important: Please contact [clinic] regarding your health records."
  - In-person when they next visit
  - Written letter for serious breaches

□ Notify clinic administrators and Ministry of Health contact

PHASE 4: REMEDIATION (72 hours - 1 week)
□ Fix technical vulnerability
□ Reset all affected passwords
□ Re-train staff on security procedures
□ Review and update security controls

PHASE 5: DOCUMENTATION
□ Breach incident report (keep for 5 years)
□ Lessons learned document
□ Update security procedures
□ Report to board/leadership

EMERGENCY CONTACTS
- Incident Commander: [Name, 24/7 phone]
- Technical Lead: [Name, phone]
- Legal Counsel: [Name, phone]
- Data Protection Officer: [Name, phone]
- Ministry of Health IT: [Contact if applicable]
```

---

## 5. Clinical Safety Statement

```
MAMA MTU CLINICAL SAFETY STATEMENT
Version 1.0 | Effective: [Date]

WHAT MAMA MTU IS:
- A digital record-keeping system for maternal and newborn health
- A tool for appointment scheduling and reminders
- A reporting system for clinic operations
- A workflow assistant for healthcare staff

WHAT MAMA MTU IS NOT:
- A diagnostic tool
- A replacement for clinical judgment
- A medical advice system
- An emergency response system

PROPER USE:
✓ Track patient history and appointments
✓ Generate reports for clinic management
✓ Send appointment reminders
✓ Maintain secure health records
✓ Support continuity of care

PROHIBITED USE:
✗ Making diagnoses based on system prompts
✗ Ignoring clinical signs because "system says OK"
✗ Using for emergency medical decisions
✗ Sharing login credentials

STAFF ACKNOWLEDGMENT REQUIRED:
All clinical staff must sign acknowledging they understand:
1. Final clinical decisions are always the provider's responsibility
2. System alerts are suggestions, not medical orders
3. Emergencies require immediate human response, not system lookup
4. Documentation accuracy is the recorder's responsibility

TRAINING CHECKLIST:
□ System navigation and login security
□ Patient data entry standards
□ When NOT to rely on system (emergencies, complex cases)
□ How to report system errors or concerns
□ Privacy and confidentiality rules

Signed: _________________ Date: _________________
Staff Name: _________________ Role: _________________
```

---

## 6. Compliance Checklist for Tanzania Pilots

### Pre-Launch Legal Requirements

- [ ] **Business Registration**: Company/NGO registered in Tanzania (BRELA or NGO Bureau)
- [ ] **Tax Clearance**: TIN obtained, tax status current
- [ ] **Data Protection Registration**: If required by Data Protection Commissioner
- [ ] **Domain Registration**: `.co.tz` or `.tz` domain secured
- [ ] **Hosting Decision**: Document where data is stored (Supabase region, etc.)

### Clinical Requirements

- [ ] **Facility Agreements**: Signed pilot agreements with each clinic/hospital
- [ ] **Medical Director Sign-off**: Clinical safety statement reviewed and signed
- [ ] **Staff Training**: All users trained on system use AND limitations
- [ ] **Consent Process**: Paper or digital consent workflow operational
- [ ] **Emergency Protocol**: Clinic knows what to do if system is down

### Technical Requirements

- [ ] **Encryption Verified**: Data encrypted at rest and in transit
- [ ] **Access Controls**: Role-based access (admin/provider/receptionist) tested
- [ ] **Audit Logging**: All record access logged and reviewable
- [ ] **Backup Tested**: Restore from backup verified monthly
- [ ] **Security Hardened**: No demo passwords, 2FA for admins, password policies

### Documentation Ready

- [ ] Privacy Notice (English + Swahili summaries posted in clinic)
- [ ] Consent Forms (printed copies available)
- [ ] Data Retention Policy (documented and communicated)
- [ ] Breach Response Plan (staff know who to call)
- [ ] Clinical Safety Statement (signed by all clinical staff)

### Reporting Ready

- [ ] Patient inquiry process: How patients request their data
- [ ] Correction process: How to fix record errors
- [ ] Complaint process: How to escalate privacy concerns
- [ ] Deletion process: How patients request data removal

---

## 7. Quick Reference: Tanzania Data Protection Act 2022

### Key Requirements for Health Apps

| Requirement | MamaMtu Compliance Action |
|-------------|------------------------|
| Lawful basis for processing | Consent via signed form |
| Purpose limitation | Only for maternal health records |
| Data minimization | Collect only what's medically necessary |
| Accuracy | Allow corrections, audit data entry |
| Storage limitation | 2 years active + 7 years archive |
| Security | Encryption, access controls, audit logs |
| Accountability | Data Protection Officer assigned |
| Individual rights | Process for access, correction, deletion |
| Breach notification | 72 hours to commissioner |

### Data Protection Officer (DPO) Responsibilities

- Monitor compliance with the Act
- Answer patient questions about their data
- Handle data subject requests (access, correction, deletion)
- Report breaches to authorities
- Maintain records of processing activities
- Train staff on data protection

### When to Notify the Commissioner

Within 72 hours if:
- Unauthorized access to patient records
- Loss of device containing health data
- Ransomware or cyberattack
- Accidental disclosure to wrong party
- Any breach affecting 100+ patients

---

## 8. Implementation Timeline

### Week 1: Legal Setup
- Register business if not done
- Draft privacy notice and consent forms
- Assign Data Protection Officer

### Week 2: Clinical Setup
- Draft clinical safety statement
- Create staff training materials
- Design patient communication posters

### Week 3: Technical Setup
- Verify encryption and access controls
- Test audit logging
- Document hosting location

### Week 4: Pilot Launch
- Post privacy notices in clinics
- Train all pilot staff
- Collect first patient consents
- Monitor and adjust process

---

**Next Steps:**
1. Customize bracketed sections with your actual details
2. Have legal counsel review before use
3. Translate full documents to Swahili if needed
4. Print and post in pilot clinics
5. Train all staff before go-live

**Remember:** Compliance builds trust. Do this right the first time.
