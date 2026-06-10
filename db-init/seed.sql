-- MySQL dump 10.13  Distrib 8.0.25, for Win64 (x86_64)
--
-- Host: localhost    Database: projects_assessment
-- ------------------------------------------------------
-- Server version	9.1.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `projects_assessment`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `projects_assessment` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `projects_assessment`;

--
-- Table structure for table `clients`
--

DROP TABLE IF EXISTS `clients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clients` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `cashflowId` int unsigned DEFAULT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `industry` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contactEmail` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contactPhone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `code` (`code`),
  UNIQUE KEY `cashflowId` (`cashflowId`),
  KEY `clients_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clients`
--

LOCK TABLES `clients` WRITE;
/*!40000 ALTER TABLE `clients` DISABLE KEYS */;
INSERT INTO `clients` VALUES (1,NULL,'WHO',NULL,'Healthcare',NULL,NULL,NULL,'2026-05-25 09:00:51','2026-05-25 09:00:51'),(2,NULL,'EDSNA',NULL,'Healthcare',NULL,NULL,NULL,'2026-05-25 09:01:03','2026-05-25 09:01:03'),(3,NULL,'EU COMMISION',NULL,NULL,NULL,NULL,NULL,'2026-05-25 09:01:20','2026-05-25 09:01:20');
/*!40000 ALTER TABLE `clients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departments` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
INSERT INTO `departments` VALUES (1,'IT','','2026-05-25 13:06:35','2026-05-25 13:06:35'),(2,'Health','','2026-05-25 13:06:47','2026-05-25 13:06:47'),(3,'Operations','','2026-05-25 13:06:57','2026-05-25 13:06:57');
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee_education`
--

DROP TABLE IF EXISTS `employee_education`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_education` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `employeeId` int unsigned NOT NULL,
  `institutionName` varchar(300) COLLATE utf8mb4_unicode_ci NOT NULL,
  `degreeTitle` varchar(300) COLLATE utf8mb4_unicode_ci NOT NULL,
  `specialization` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dateAwarded` date DEFAULT NULL,
  `recognized` enum('yes','no') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `employeeId` (`employeeId`),
  CONSTRAINT `employee_education_ibfk_1` FOREIGN KEY (`employeeId`) REFERENCES `employees` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee_education`
--

LOCK TABLES `employee_education` WRITE;
/*!40000 ALTER TABLE `employee_education` DISABLE KEYS */;
INSERT INTO `employee_education` VALUES (1,3,'Mediteranian University of Crete','Applied Informatics and Multimedia','Information Technology','2015-12-22','yes','2026-05-29 13:26:29','2026-05-29 14:55:24'),(2,3,'University of Pireus','Information System','Big Data & Analytics','2024-10-10','yes','2026-05-29 13:27:55','2026-05-29 14:54:49');
/*!40000 ALTER TABLE `employee_education` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee_languages`
--

DROP TABLE IF EXISTS `employee_languages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_languages` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `employeeId` int unsigned NOT NULL,
  `language` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `degreeTitle` varchar(300) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `level` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `employeeId` (`employeeId`),
  CONSTRAINT `employee_languages_ibfk_1` FOREIGN KEY (`employeeId`) REFERENCES `employees` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee_languages`
--

LOCK TABLES `employee_languages` WRITE;
/*!40000 ALTER TABLE `employee_languages` DISABLE KEYS */;
INSERT INTO `employee_languages` VALUES (1,3,'English','University of Michigan','B2','2026-05-29 13:48:58','2026-05-29 13:49:49');
/*!40000 ALTER TABLE `employee_languages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employees`
--

DROP TABLE IF EXISTS `employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employees` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `firstName` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lastName` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `department` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `photo` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `fatherName` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `motherName` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dateOfBirth` date DEFAULT NULL,
  `placeOfBirth` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `homeAddress` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `employees_email` (`email`),
  KEY `employees_department` (`department`),
  KEY `employees_is_active` (`isActive`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees`
--

LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
INSERT INTO `employees` VALUES (1,'John','Doe','john.doe@company.com','Engineering',1,NULL,'2026-05-22 13:11:54','2026-05-22 13:13:40',NULL,NULL,NULL,NULL,NULL,NULL),(2,'Jane','Smith','jane.smith@company.com','Design',1,NULL,'2026-05-22 13:13:33','2026-05-22 13:13:33',NULL,NULL,NULL,NULL,NULL,NULL),(3,'Ilias','Zampetakis','media@artius.gr','IT',1,'/uploads/employees/emp_1779703884895_8n1p6y4a25r.webp','2026-05-22 13:49:26','2026-05-29 13:25:18','Giorgios','Antonia','1990-12-31','attiki','6972795587','Spirou Merkouri 38'),(4,'Ippokratis','Geranakis','igeranakis@cmtprooptiki.gr','Engineering',1,NULL,'2026-05-22 13:52:39','2026-05-25 10:12:00',NULL,NULL,NULL,NULL,NULL,NULL),(5,'Antonis','Palios','apalios@cmtprooptiki.gr','IT',1,NULL,'2026-05-25 12:32:40','2026-05-25 13:07:29',NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `employees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_participations`
--

DROP TABLE IF EXISTS `project_participations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_participations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `employeeId` int unsigned NOT NULL,
  `projectId` int unsigned NOT NULL,
  `roleId` int unsigned NOT NULL,
  `startDate` date NOT NULL,
  `endDate` date DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `project_participations_employee_id` (`employeeId`),
  KEY `project_participations_project_id` (`projectId`),
  KEY `project_participations_role_id` (`roleId`),
  KEY `project_participations_start_date_end_date` (`startDate`,`endDate`),
  CONSTRAINT `project_participations_ibfk_1` FOREIGN KEY (`employeeId`) REFERENCES `employees` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `project_participations_ibfk_2` FOREIGN KEY (`projectId`) REFERENCES `projects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `project_participations_ibfk_3` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_participations`
--

LOCK TABLES `project_participations` WRITE;
/*!40000 ALTER TABLE `project_participations` DISABLE KEYS */;
INSERT INTO `project_participations` VALUES (1,1,1,1,'2024-01-01','2024-06-30','Full-time allocation on frontend module.','2026-05-22 13:18:38','2026-05-22 13:18:38'),(2,3,2,5,'2024-02-01','2024-06-08','','2026-05-22 13:54:19','2026-05-22 13:55:06'),(3,3,1,1,'2024-06-22','2024-06-30','','2026-05-22 15:11:55','2026-05-22 15:11:55'),(4,4,3,3,'2026-04-08','2026-05-25','','2026-05-25 10:31:28','2026-05-25 10:31:28'),(5,3,1,1,'2026-04-01','2026-04-30','','2026-05-25 10:40:47','2026-05-25 10:40:47'),(6,5,1,2,'2024-01-01','2024-09-30','','2026-05-25 12:34:40','2026-05-25 12:34:40'),(7,2,3,3,'2026-04-01','2026-05-29','','2026-05-29 19:13:55','2026-05-29 19:13:55');
/*!40000 ALTER TABLE `project_participations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `projects`
--

DROP TABLE IF EXISTS `projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `projects` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `startDate` date NOT NULL,
  `endDate` date DEFAULT NULL,
  `status` enum('active','completed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `budget` decimal(12,2) DEFAULT NULL,
  `confirmationOfGoodPerformance` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `clientId` int unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  UNIQUE KEY `projects_code` (`code`),
  KEY `projects_status` (`status`),
  KEY `projects_client_id` (`clientId`),
  CONSTRAINT `projects_clientId_foreign_idx` FOREIGN KEY (`clientId`) REFERENCES `clients` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `projects`
--

LOCK TABLES `projects` WRITE;
/*!40000 ALTER TABLE `projects` DISABLE KEYS */;
INSERT INTO `projects` VALUES (1,'Paratiritirio','ALPHA-001','Project paused pending client approval.','2024-01-01','2024-12-31','completed',NULL,NULL,'2026-05-22 13:14:06','2026-05-25 12:42:07',2),(2,'Drone Project','ΣΥΝΛ-00000142','EU PROJECT 231','2024-03-01','2026-05-28','completed',5264354.00,'Ta pigame exairetika se ayto to Drone project.Eimaste oi kaluteroi apo olous.','2026-05-22 13:14:12','2026-06-10 10:05:37',3),(3,'Health IQ','WHO-004','Migrating legacy systems to the cloud.','2023-06-01',NULL,'active',NULL,NULL,'2026-05-22 13:14:16','2026-05-29 14:25:49',1);
/*!40000 ALTER TABLE `projects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `roles_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Frontend Developer','Updated description for this role.','2026-05-22 13:14:37','2026-05-22 13:16:46'),(2,'Backend Developer','Responsible for server-side logic and APIs.','2026-05-22 13:14:40','2026-05-22 13:14:40'),(3,'Project Manager','Responsible for project planning, tracking, and delivery.','2026-05-22 13:16:39','2026-05-22 13:16:39'),(4,'Tech Lead','Responsible for technical direction and code reviews.','2026-05-22 13:16:40','2026-05-22 13:16:40'),(5,'UX Designer','UX Designer Role','2026-05-22 13:54:49','2026-05-22 13:54:49');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sequelizemeta`
--

DROP TABLE IF EXISTS `sequelizemeta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sequelizemeta` (
  `name` varchar(255) COLLATE utf8mb3_unicode_ci NOT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sequelizemeta`
--

LOCK TABLES `sequelizemeta` WRITE;
/*!40000 ALTER TABLE `sequelizemeta` DISABLE KEYS */;
INSERT INTO `sequelizemeta` VALUES ('20240101000001-create-employees.js'),('20240101000002-create-projects.js'),('20240101000003-create-roles.js'),('20240101000004-create-project-participations.js'),('20240101000005-create-users.js'),('20240101000006-remove-allocation-percentage.js'),('20240101000007-create-clients.js'),('20240101000008-update-projects-add-clientid.js'),('20240101000009-add-code-to-clients.js'),('20240101000009-add-photo-to-employees.js'),('20240101000010-create-departments.js'),('20240101000011-update-employees-position-to-roleid.js'),('20240101000012-drop-employees-roleid.js'),('20240101000013-add-personal-fields-to-employees.js'),('20240101000014-create-employee-education.js'),('20240101000015-create-employee-languages.js'),('20240101000016-simplify-project-status.js'),('20240101000017-add-recognized-to-education.js'),('20240101000018-add-budget-confirmation-to-projects.js'),('20240101000019-add-cashflow-id-to-clients.js');
/*!40000 ALTER TABLE `sequelizemeta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `firstName` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lastName` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admin','user') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `users_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin@gmail.com','$argon2id$v=19$m=65536,t=3,p=4$3PYEAYodccWTRIryIJKccw$36lS366T6GXdL1UyAr/nwKppIwmcZXVfBgdT8bqiSBs','Admin','User','admin','2026-05-22 14:36:56','2026-05-22 14:36:56'),(2,'apalios@cmtprooptiki.gr','$argon2id$v=19$m=65536,t=3,p=4$U/NkvvU9qU5xs3T17Azbqw$fL1faf0Dh06iGm0bn/z6l7tk2DuMceHhU54tCI3ppN8','adonis','palios','user','2026-05-26 14:37:19','2026-05-26 14:37:19');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-10 17:52:13
