# Patient History Aggregation Pipeline

`GET /api/patients/:patientId/history` returns a patient's complete medical
timeline — every appointment, the doctor who handled it, and the prescription
written (if any) — in a **single database round trip**.

The pipeline lives in `services/patientHistoryService.ts` (`getFullPatientHistory`).

## Pipeline stages

| Stage | Operator | Purpose |
|---|---|---|
| 1 | `$match` | Keep only this patient's appointments |
| 2 | `$sort` | Most recent appointment first |
| 3 | `$lookup` (prescriptions) | Attach the prescription for each appointment |
| 4 | `$unwind` (preserveNullAndEmptyArrays) | Flatten the prescription array to a single object |
| 5 | `$lookup` (doctors) + `$unwind` | Attach the doctor profile |
| 6 | `$lookup` (users) + `$unwind` | Resolve the doctor's name from the user account |
| 7 | `$project` | Reshape to only the fields the timeline UI needs |

## 1. Why `$lookup` instead of multiple queries

Without aggregation, building this view needs N+1 queries: one for the
appointments, then one prescription lookup, one doctor lookup, and one user
lookup *per appointment*. `$lookup` performs those joins inside the database
engine in one request, eliminating network round trips and letting MongoDB
optimize the join order.

## 2. What `preserveNullAndEmptyArrays` does and why it matters

`$lookup` always produces an array (`prescription: []` when no match). `$unwind`
on an empty array would **drop the document entirely** by default — meaning
appointments with no prescription would vanish from the history. Setting
`preserveNullAndEmptyArrays: true` keeps those appointments; their `prescription`
field simply has no `_id`/`diagnosis`. A patient's history must show *every*
visit, prescribed or not, so this flag is essential.

## 3. How `$project` reduces data transfer

Appointment, doctor, user, and prescription documents carry fields the timeline
never displays (`createdBy`, `userId`, `__v`, password hashes, timestamps, etc.).
The final `$project` stage emits only the seven fields the frontend renders, so
less data crosses the wire and no sensitive fields (like the doctor's user
record) leak into the response.

## 4. Index impact

`appointments` has an index on `patientId` (declared in `models/Appointment.ts`).
Stage 1's `$match: { patientId }` uses that index, so the pipeline starts from a
small, already-filtered set instead of scanning the whole collection. The
`$lookup` joins hit `_id` (always indexed) and `prescriptions.appointmentId`
(unique index), so every join is index-backed too.

## 5. Performance note

Because `$match` is index-backed and runs first, and every subsequent `$lookup`
joins on an indexed field, this pipeline never performs a full collection scan.
It scales with the number of appointments for **one patient**, not the size of
the whole `appointments` collection.
