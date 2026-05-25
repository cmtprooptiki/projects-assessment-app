# API Documentation

# Employees

## Get All Employees

GET /api/employees

## Get Employee By ID

GET /api/employees/:id

## Create Employee

POST /api/employees

## Update Employee

PUT /api/employees/:id

## Delete Employee

DELETE /api/employees/:id

---

# Projects

## Get All Projects

GET /api/projects

## Get Project By ID

GET /api/projects/:id

## Create Project

POST /api/projects

## Update Project

PUT /api/projects/:id

## Delete Project

DELETE /api/projects/:id

---

# Roles

## Get All Roles

GET /api/roles

## Create Role

POST /api/roles

## Update Role

PUT /api/roles/:id

## Delete Role

DELETE /api/roles/:id

---

# Participations

## Get All Participations

GET /api/participations

## Get Participation By ID

GET /api/participations/:id

## Create Participation

POST /api/participations

## Update Participation

PUT /api/participations/:id

## Delete Participation

DELETE /api/participations/:id

---

# Dashboard APIs

## Project Dashboard

GET /api/dashboard/project/:projectId

## Employee Dashboard

GET /api/dashboard/employee/:employeeId

## Dashboard Summary

GET /api/dashboard/summary

## Filtered Participations

GET /api/dashboard/participations

Query Parameters:

* projectId
* employeeId
* roleId
* startDate
* endDate
* year
* month
