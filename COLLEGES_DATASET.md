# SkillTrack AI — Engineering Colleges Dataset Documentation

## Overview & Purpose
This document provides official metadata and architectural details for SkillTrack AI's India-wide Engineering College Catalog database.

---

## Dataset Properties
- **Coverage**: Engineering and technology education institutions across **28 States and 8 Union Territories** in India (including autonomous colleges, IITs, NITs, IIITs, Government institutions, state universities, deemed universities, and recognized private engineering colleges).
- **Primary Source Categorization**: Verified public datasets (including AICTE institution registries, Ministry of Education / NIRF engineering data, and state technical university affiliation databases).
- **Import Timestamp**: August 2026
- **Total Seed Count**: 65+ core verified engineering institutions with dynamic unlisted request fallback (`CollegeRequest`).

---

## Normalization & Deduplication Pipeline
1. **Normalized Search Tokens (`normalizedName`)**:
   - Each institution name is converted to a lowercase alphanumeric string stripping punctuation and extra whitespace.
   - Example:
     - Official Name: `"Prasad V. Potluri Siddhartha Institute of Technology"`
     - `normalizedName`: `"prasadvpotlurisiddharthainstituteoftechnology"`
2. **Idempotent Upsert Strategy**:
   - Seeding runs `College.findOneAndUpdate({ name: item.name }, { $set: { ...item, normalizedName } }, { upsert: true })`.
   - Running `npm run seed:colleges` repeatedly will update existing records without creating duplicates.
3. **Compound Text Search Index**:
   - MongoDB text index: `{ name: 'text', normalizedName: 'text', shortName: 'text', city: 'text', state: 'text' }`.

---

## Updating the Dataset Future Workflow
1. Add new institution objects to [`backend/src/data/indiaCollegesDataset.ts`](file:///d:/SkillTrack/backend/src/data/indiaCollegesDataset.ts).
2. Run `npm run seed:colleges` in `d:\SkillTrack\backend`.
3. MongoDB will idempotently insert or update records without breaking existing student profile `collegeId` references.
