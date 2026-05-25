# Database Design

# Employee Table

| Field      | Type     |
| ---------- | -------- |
| id         | integer  |
| firstName  | string   |
| lastName   | string   |
| email      | string   |
| department | string   |
| position   | string   |
| isActive   | boolean  |
| createdAt  | datetime |
| updatedAt  | datetime |

---

# Project Table

| Field       | Type     |
| ----------- | -------- |
| id          | integer  |
| name        | string   |
| code        | string   |
| description | text     |
| clientName  | string   |
| startDate   | date     |
| endDate     | date     |
| status      | string   |
| createdAt   | datetime |
| updatedAt   | datetime |

---

# Role Table

| Field       | Type    |
| ----------- | ------- |
| id          | integer |
| name        | string  |
| description | text    |

---

# ProjectParticipation Table

| Field                | Type     |
| -------------------- | -------- |
| id                   | integer  |
| employeeId           | integer  |
| projectId            | integer  |
| roleId               | integer  |
| startDate            | date     |
| endDate              | date     |
| allocationPercentage | integer  |
| notes                | text     |
| createdAt            | datetime |
| updatedAt            | datetime |

---

# Relationships

## Employee

* hasMany(ProjectParticipation)

## Project

* hasMany(ProjectParticipation)

## Role

* hasMany(ProjectParticipation)

## ProjectParticipation

* belongsTo(Employee)
* belongsTo(Project)
* belongsTo(Role)

---

# Important Logic

The system must calculate:

* Total participation months
* Participation periods
* Monthly allocations
* Yearly participation statistics
