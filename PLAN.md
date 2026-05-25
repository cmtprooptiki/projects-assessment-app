# Employee Project Participation Monitoring System

## Project Goal

Build a web application that allows the company to:

* Register employees, projects, roles, and participation periods
* Monitor employee participation across projects
* View participation analytics and statistics through an interactive dashboard

---

# Main Features

## Register/Admin Side

The system must allow administrators to:

* Create and manage employees
* Create and manage projects
* Create and manage roles
* Register employee participation in projects
* Edit participation periods
* Assign roles to employees per project

---

## Dashboard/View Side

The dashboard must answer the following questions:

* Which employees participated in a specific project?
* For how many months did an employee participate in a project?
* Which exact months and years did participation occur?
* What role did each employee have in the project?
* Which projects has a specific employee worked on?
* What is the allocation percentage of each employee?

---

# Filtering Requirements

The system must support filtering by:

* Employee
* Project
* Role
* Department
* Month
* Year
* Start Date
* End Date
* Project Status

---

# Technology Stack

## Frontend

* Next.js
* TypeScript
* Tailwind CSS
* React Query or Axios
* Recharts

## Backend

* Node.js
* Express.js
* Sequelize ORM
* JWT Authentication
* MySQL

---

# Core Database Entities

## Employee

Stores employee information.

## Project

Stores project information.

## Role

Stores project role types.

## ProjectParticipation

Connects employees with projects and stores:

* role
* start date
* end date
* allocation percentage

---

# Application Architecture

## Frontend

* Dashboard
* CRUD Forms
* Tables
* Charts
* Filters
* Authentication

## Backend

* REST APIs
* Authentication Middleware
* Validation Middleware
* Controllers
* Services
* Sequelize Models

---

# Development Phases

## Phase 1

Backend setup and database architecture.

## Phase 2

CRUD APIs and authentication.

## Phase 3

Frontend structure and layout.

## Phase 4

CRUD frontend pages.

## Phase 5

Dashboard analytics and filtering.

## Phase 6

Testing and deployment.
