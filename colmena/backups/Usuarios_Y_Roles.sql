-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: dbmicolmena
-- ------------------------------------------------------
-- Server version	8.0.46

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
-- Current Database: `dbmicolmena`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `dbmicolmena` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `dbmicolmena`;

--
-- Table structure for table `administrador`
--

DROP TABLE IF EXISTS `administrador`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `administrador` (
  `Id_Administrador` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `Id_Rol` int DEFAULT NULL,
  `Celular` varchar(20) DEFAULT NULL,
  `FechaRegistro` date DEFAULT NULL,
  `NivelAcceso` varchar(50) DEFAULT NULL,
  `FotoPerfil` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`Id_Administrador`),
  UNIQUE KEY `user_id` (`user_id`),
  KEY `Id_Rol` (`Id_Rol`),
  CONSTRAINT `administrador_ibfk_1` FOREIGN KEY (`Id_Rol`) REFERENCES `rol` (`Id_Rol`),
  CONSTRAINT `fk_admin_user` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`),
  CONSTRAINT `fk_administrador_user` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `administrador`
--

LOCK TABLES `administrador` WRITE;
/*!40000 ALTER TABLE `administrador` DISABLE KEYS */;
INSERT INTO `administrador` VALUES (3,3,1,NULL,NULL,'Alto','usuarios/administradores/Captura_de_pantalla_2026-08-16_211634.png'),(4,7,1,'3148443004','2026-08-16','Medio','usuarios/administradores/peakpx.jpg');
/*!40000 ALTER TABLE `administrador` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `apiario`
--

DROP TABLE IF EXISTS `apiario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `apiario` (
  `Id_Apiario` int NOT NULL AUTO_INCREMENT,
  `Id_Apicultor` int NOT NULL,
  `NombreApiario` varchar(100) DEFAULT NULL,
  `CantidadColmenas` int DEFAULT NULL,
  `EstadoApiario` varchar(50) DEFAULT NULL,
  `FechaEclosionApiario` date DEFAULT NULL,
  `Ubicacion` varchar(150) DEFAULT NULL,
  `Descripcion` text,
  `Imagen` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`Id_Apiario`),
  KEY `Id_Apicultor` (`Id_Apicultor`),
  CONSTRAINT `apiario_ibfk_1` FOREIGN KEY (`Id_Apicultor`) REFERENCES `apicultor` (`Id_Apicultor`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `apiario`
--

LOCK TABLES `apiario` WRITE;
/*!40000 ALTER TABLE `apiario` DISABLE KEYS */;
INSERT INTO `apiario` VALUES (3,7,'Apiario La Esperanza Editado',11,'Bueno','2026-06-06','urrao - chuzcal','None','apiarios/WIN_20260806_08_09_17_Pro_xPSKanz.jpg'),(4,7,'Prado del Sol',14,'Precaución','2026-07-09','urrao city','hola mundo','apiarios/peakpx.jpg');
/*!40000 ALTER TABLE `apiario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `apicultor`
--

DROP TABLE IF EXISTS `apicultor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `apicultor` (
  `Id_Apicultor` int NOT NULL AUTO_INCREMENT,
  `Id_Rol` int DEFAULT NULL,
  `Identificacion` varchar(30) DEFAULT NULL,
  `Telefono` varchar(20) DEFAULT NULL,
  `Zona_Trabajo` varchar(100) DEFAULT NULL,
  `ExperienciaAnios` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `FotoPerfil` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`Id_Apicultor`),
  UNIQUE KEY `user_id` (`user_id`),
  UNIQUE KEY `uq_apicultor_identificacion` (`Identificacion`),
  KEY `Id_Rol` (`Id_Rol`),
  CONSTRAINT `apicultor_ibfk_1` FOREIGN KEY (`Id_Rol`) REFERENCES `rol` (`Id_Rol`),
  CONSTRAINT `fk_apicultor_user` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `apicultor`
--

LOCK TABLES `apicultor` WRITE;
/*!40000 ALTER TABLE `apicultor` DISABLE KEYS */;
INSERT INTO `apicultor` VALUES (7,2,'111114','323232323232','sabanas',3,2,'usuarios/apicultores/Gemini_Generated_Image_d2flc9d2flc9d2fl.png'),(8,2,'1041531401','3235266808','urrao',7,5,'usuarios/apicultores/fotoooo.png'),(9,2,'232323232323',NULL,'sabanas',2,6,'usuarios/apicultores/padre.jpg');
/*!40000 ALTER TABLE `apicultor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_group`
--

DROP TABLE IF EXISTS `auth_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_group` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group`
--

LOCK TABLES `auth_group` WRITE;
/*!40000 ALTER TABLE `auth_group` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_group` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_group_permissions`
--

DROP TABLE IF EXISTS `auth_group_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_group_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `group_id` int NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_group_permissions_group_id_permission_id_0cd325b0_uniq` (`group_id`,`permission_id`),
  KEY `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` (`permission_id`),
  CONSTRAINT `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `auth_group_permissions_group_id_b120cbf9_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group_permissions`
--

LOCK TABLES `auth_group_permissions` WRITE;
/*!40000 ALTER TABLE `auth_group_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_group_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_permission`
--

DROP TABLE IF EXISTS `auth_permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_permission` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `content_type_id` int NOT NULL,
  `codename` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_permission_content_type_id_codename_01ab375a_uniq` (`content_type_id`,`codename`),
  CONSTRAINT `auth_permission_content_type_id_2f476e4b_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=85 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_permission`
--

LOCK TABLES `auth_permission` WRITE;
/*!40000 ALTER TABLE `auth_permission` DISABLE KEYS */;
INSERT INTO `auth_permission` VALUES (1,'Can add log entry',1,'add_logentry'),(2,'Can change log entry',1,'change_logentry'),(3,'Can delete log entry',1,'delete_logentry'),(4,'Can view log entry',1,'view_logentry'),(5,'Can add permission',3,'add_permission'),(6,'Can change permission',3,'change_permission'),(7,'Can delete permission',3,'delete_permission'),(8,'Can view permission',3,'view_permission'),(9,'Can add group',2,'add_group'),(10,'Can change group',2,'change_group'),(11,'Can delete group',2,'delete_group'),(12,'Can view group',2,'view_group'),(13,'Can add user',4,'add_user'),(14,'Can change user',4,'change_user'),(15,'Can delete user',4,'delete_user'),(16,'Can view user',4,'view_user'),(17,'Can add content type',5,'add_contenttype'),(18,'Can change content type',5,'change_contenttype'),(19,'Can delete content type',5,'delete_contenttype'),(20,'Can view content type',5,'view_contenttype'),(21,'Can add session',6,'add_session'),(22,'Can change session',6,'change_session'),(23,'Can delete session',6,'delete_session'),(24,'Can view session',6,'view_session'),(25,'Can add administrador',7,'add_administrador'),(26,'Can change administrador',7,'change_administrador'),(27,'Can delete administrador',7,'delete_administrador'),(28,'Can view administrador',7,'view_administrador'),(29,'Can add apiario',8,'add_apiario'),(30,'Can change apiario',8,'change_apiario'),(31,'Can delete apiario',8,'delete_apiario'),(32,'Can view apiario',8,'view_apiario'),(33,'Can add apicultor',9,'add_apicultor'),(34,'Can change apicultor',9,'change_apicultor'),(35,'Can delete apicultor',9,'delete_apicultor'),(36,'Can view apicultor',9,'view_apicultor'),(37,'Can add colmena',10,'add_colmena'),(38,'Can change colmena',10,'change_colmena'),(39,'Can delete colmena',10,'delete_colmena'),(40,'Can view colmena',10,'view_colmena'),(41,'Can add costos',11,'add_costos'),(42,'Can change costos',11,'change_costos'),(43,'Can delete costos',11,'delete_costos'),(44,'Can view costos',11,'view_costos'),(45,'Can add exportacion',12,'add_exportacion'),(46,'Can change exportacion',12,'change_exportacion'),(47,'Can delete exportacion',12,'delete_exportacion'),(48,'Can view exportacion',12,'view_exportacion'),(49,'Can add incidencia',13,'add_incidencia'),(50,'Can change incidencia',13,'change_incidencia'),(51,'Can delete incidencia',13,'delete_incidencia'),(52,'Can view incidencia',13,'view_incidencia'),(53,'Can add mantenimiento',14,'add_mantenimiento'),(54,'Can change mantenimiento',14,'change_mantenimiento'),(55,'Can delete mantenimiento',14,'delete_mantenimiento'),(56,'Can view mantenimiento',14,'view_mantenimiento'),(57,'Can add reporte',15,'add_reporte'),(58,'Can change reporte',15,'change_reporte'),(59,'Can delete reporte',15,'delete_reporte'),(60,'Can view reporte',15,'view_reporte'),(61,'Can add rol',16,'add_rol'),(62,'Can change rol',16,'change_rol'),(63,'Can delete rol',16,'delete_rol'),(64,'Can view rol',16,'view_rol'),(65,'Can add seguimientoapicola',17,'add_seguimientoapicola'),(66,'Can change seguimientoapicola',17,'change_seguimientoapicola'),(67,'Can delete seguimientoapicola',17,'delete_seguimientoapicola'),(68,'Can view seguimientoapicola',17,'view_seguimientoapicola'),(69,'Can add Registro laboral mensual',18,'add_registrolaboralmensual'),(70,'Can change Registro laboral mensual',18,'change_registrolaboralmensual'),(71,'Can delete Registro laboral mensual',18,'delete_registrolaboralmensual'),(72,'Can view Registro laboral mensual',18,'view_registrolaboralmensual'),(73,'Can add Vinculación del apicultor',19,'add_vinculacionapicultor'),(74,'Can change Vinculación del apicultor',19,'change_vinculacionapicultor'),(75,'Can delete Vinculación del apicultor',19,'delete_vinculacionapicultor'),(76,'Can view Vinculación del apicultor',19,'view_vinculacionapicultor'),(77,'Can add Evento de agenda',20,'add_eventoagenda'),(78,'Can change Evento de agenda',20,'change_eventoagenda'),(79,'Can delete Evento de agenda',20,'delete_eventoagenda'),(80,'Can view Evento de agenda',20,'view_eventoagenda'),(81,'Can add Historial de reporte',21,'add_historialreporte'),(82,'Can change Historial de reporte',21,'change_historialreporte'),(83,'Can delete Historial de reporte',21,'delete_historialreporte'),(84,'Can view Historial de reporte',21,'view_historialreporte');
/*!40000 ALTER TABLE `auth_permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_user`
--

DROP TABLE IF EXISTS `auth_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `password` varchar(128) NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `username` varchar(150) NOT NULL,
  `first_name` varchar(150) NOT NULL,
  `last_name` varchar(150) NOT NULL,
  `email` varchar(254) NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `date_joined` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_user`
--

LOCK TABLES `auth_user` WRITE;
/*!40000 ALTER TABLE `auth_user` DISABLE KEYS */;
INSERT INTO `auth_user` VALUES (2,'pbkdf2_sha256$1200000$2iLjm6lbIZQo5aOBjHmQFI$0TD6/Lci0rBJa7QhQb1x56goAeBGTz77JC4WDTsdO2w=','2026-07-19 18:08:06.835551',0,'juanko89@gmail.com','Juan cito','herrerita','juanko89@gmail.com',0,1,'2026-07-18 18:21:07.541260'),(3,'pbkdf2_sha256$1200000$ooVQ96r5k7M2LDJlQlkthl$YFrJl59nY3AEOrZpT55MQw7zyRoC8CK4AkuXUBxXogg=','2026-08-18 13:56:42.469033',1,'col','col','\" \"','col@gmail.com',1,1,'2026-07-19 17:56:10.432302'),(5,'pbkdf2_sha256$1200000$O4utlNfkRFIXW848WelSuP$UawUJirRxXm2PKCMJPd7WStyE96peVFcgGPxm3jU7DI=',NULL,0,'juanku690@gmail.com','DRO Juan','Herrera','juanku690@gmail.com',0,1,'2026-07-19 18:22:44.083025'),(6,'pbkdf2_sha256$1200000$RSZ2tQQxNtnm8Hn9SA583e$AIIWfDUUZ67k4Bac0KoC3hrGb/WxSPkS+urEH8jUXUk=',NULL,0,'jopolo@gmail.com','jose','duque','jopolo@gmail.com',0,1,'2026-07-19 21:38:02.384599'),(7,'pbkdf2_sha256$1200000$D2PHX9s9AFBsRUxwnNGaGr$WBsi8gtOtJ/y/NuMMBT1ccP5X4UH+c/e+HuiQfnbxCA=','2026-08-18 13:56:16.423729',0,'mildre-84@hotmail.com','Diiana Mildrey','Jimenez Herrera','mildre-84@hotmail.com',0,1,'2026-08-16 18:49:44.639083');
/*!40000 ALTER TABLE `auth_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_user_groups`
--

DROP TABLE IF EXISTS `auth_user_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_user_groups` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `group_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_user_groups_user_id_group_id_94350c0c_uniq` (`user_id`,`group_id`),
  KEY `auth_user_groups_group_id_97559544_fk_auth_group_id` (`group_id`),
  CONSTRAINT `auth_user_groups_group_id_97559544_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`),
  CONSTRAINT `auth_user_groups_user_id_6a12ed8b_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_user_groups`
--

LOCK TABLES `auth_user_groups` WRITE;
/*!40000 ALTER TABLE `auth_user_groups` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_user_groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_user_user_permissions`
--

DROP TABLE IF EXISTS `auth_user_user_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_user_user_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_user_user_permissions_user_id_permission_id_14a6b632_uniq` (`user_id`,`permission_id`),
  KEY `auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm` (`permission_id`),
  CONSTRAINT `auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `auth_user_user_permissions_user_id_a95ead1b_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_user_user_permissions`
--

LOCK TABLES `auth_user_user_permissions` WRITE;
/*!40000 ALTER TABLE `auth_user_user_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_user_user_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `colmena`
--

DROP TABLE IF EXISTS `colmena`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `colmena` (
  `Id_Colmena` int NOT NULL AUTO_INCREMENT,
  `Id_Apiario` int NOT NULL,
  `CodigoColmena` varchar(50) DEFAULT NULL,
  `EstadoColmena` varchar(50) DEFAULT NULL,
  `FechaRegistro` date DEFAULT NULL,
  `Descripcion` text,
  `Imagen` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`Id_Colmena`),
  KEY `Id_Apiario` (`Id_Apiario`),
  CONSTRAINT `colmena_ibfk_1` FOREIGN KEY (`Id_Apiario`) REFERENCES `apiario` (`Id_Apiario`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `colmena`
--

LOCK TABLES `colmena` WRITE;
/*!40000 ALTER TABLE `colmena` DISABLE KEYS */;
INSERT INTO `colmena` VALUES (1,4,'CM00000001','Activa','2026-07-31','colemna 2 ','colmenas/peakpx.jpg'),(2,4,'CM00000002','Riesgo','2026-07-10','falta de reina ','colmenas/peakpx_QFT2SnU.jpg');
/*!40000 ALTER TABLE `colmena` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_admin_log`
--

DROP TABLE IF EXISTS `django_admin_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_admin_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `action_time` datetime(6) NOT NULL,
  `object_id` longtext,
  `object_repr` varchar(200) NOT NULL,
  `action_flag` smallint unsigned NOT NULL,
  `change_message` longtext NOT NULL,
  `content_type_id` int DEFAULT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `django_admin_log_content_type_id_c4bce8eb_fk_django_co` (`content_type_id`),
  KEY `django_admin_log_user_id_c564eba6_fk_auth_user_id` (`user_id`),
  CONSTRAINT `django_admin_log_content_type_id_c4bce8eb_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`),
  CONSTRAINT `django_admin_log_user_id_c564eba6_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`),
  CONSTRAINT `django_admin_log_chk_1` CHECK ((`action_flag` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_admin_log`
--

LOCK TABLES `django_admin_log` WRITE;
/*!40000 ALTER TABLE `django_admin_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `django_admin_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_content_type`
--

DROP TABLE IF EXISTS `django_content_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_content_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `app_label` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label`,`model`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_content_type`
--

LOCK TABLES `django_content_type` WRITE;
/*!40000 ALTER TABLE `django_content_type` DISABLE KEYS */;
INSERT INTO `django_content_type` VALUES (1,'admin','logentry'),(2,'auth','group'),(3,'auth','permission'),(4,'auth','user'),(5,'contenttypes','contenttype'),(7,'dbmicolmena','administrador'),(8,'dbmicolmena','apiario'),(9,'dbmicolmena','apicultor'),(10,'dbmicolmena','colmena'),(11,'dbmicolmena','costos'),(20,'dbmicolmena','eventoagenda'),(12,'dbmicolmena','exportacion'),(21,'dbmicolmena','historialreporte'),(13,'dbmicolmena','incidencia'),(14,'dbmicolmena','mantenimiento'),(18,'dbmicolmena','registrolaboralmensual'),(15,'dbmicolmena','reporte'),(16,'dbmicolmena','rol'),(17,'dbmicolmena','seguimientoapicola'),(19,'dbmicolmena','vinculacionapicultor'),(6,'sessions','session');
/*!40000 ALTER TABLE `django_content_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_migrations`
--

DROP TABLE IF EXISTS `django_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_migrations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `app` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `applied` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_migrations`
--

LOCK TABLES `django_migrations` WRITE;
/*!40000 ALTER TABLE `django_migrations` DISABLE KEYS */;
INSERT INTO `django_migrations` VALUES (1,'contenttypes','0001_initial','2026-07-05 16:50:00.998407'),(2,'auth','0001_initial','2026-07-05 16:50:01.626384'),(3,'admin','0001_initial','2026-07-05 16:50:01.950805'),(4,'admin','0002_logentry_remove_auto_add','2026-07-05 16:50:01.958220'),(5,'admin','0003_logentry_add_action_flag_choices','2026-07-05 16:50:01.963860'),(6,'contenttypes','0002_remove_content_type_name','2026-07-05 16:50:02.069365'),(7,'auth','0002_alter_permission_name_max_length','2026-07-05 16:50:02.137062'),(8,'auth','0003_alter_user_email_max_length','2026-07-05 16:50:02.159066'),(9,'auth','0004_alter_user_username_opts','2026-07-05 16:50:02.166927'),(10,'auth','0005_alter_user_last_login_null','2026-07-05 16:50:02.221143'),(11,'auth','0006_require_contenttypes_0002','2026-07-05 16:50:02.221143'),(12,'auth','0007_alter_validators_add_error_messages','2026-07-05 16:50:02.231126'),(13,'auth','0008_alter_user_username_max_length','2026-07-05 16:50:02.299099'),(14,'auth','0009_alter_user_last_name_max_length','2026-07-05 16:50:02.361245'),(15,'auth','0010_alter_group_name_max_length','2026-07-05 16:50:02.391195'),(16,'auth','0011_update_proxy_permissions','2026-07-05 16:50:02.391195'),(17,'auth','0012_alter_user_first_name_max_length','2026-07-05 16:50:02.466625'),(18,'sessions','0001_initial','2026-07-05 16:50:02.513024'),(19,'dbmicolmena','0001_initial','2026-07-05 19:11:06.677863'),(20,'dbmicolmena','0002_crear_registro_laboral','2026-07-19 20:43:05.048830'),(21,'dbmicolmena','0003_crear_eventos_agenda','2026-07-29 21:22:43.807512'),(22,'dbmicolmena','0004_crear_historial_reportes','2026-07-29 21:22:43.869978'),(23,'dbmicolmena','0005_delete_costos','2026-07-29 22:28:23.679066'),(24,'dbmicolmena','0006_alter_historialreporte_tipo_reporte','2026-08-05 20:06:13.882738');
/*!40000 ALTER TABLE `django_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_session`
--

DROP TABLE IF EXISTS `django_session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_session` (
  `session_key` varchar(40) NOT NULL,
  `session_data` longtext NOT NULL,
  `expire_date` datetime(6) NOT NULL,
  PRIMARY KEY (`session_key`),
  KEY `django_session_expire_date_a5c62663` (`expire_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_session`
--

LOCK TABLES `django_session` WRITE;
/*!40000 ALTER TABLE `django_session` DISABLE KEYS */;
INSERT INTO `django_session` VALUES ('02f9hl38ipfj20eq9ag5wwv12jcfcorf','.eJxVjEsOwjAMBe-SNYpKTOqaJXvOUDm2QwsokfpZIe4OlbqA7ZuZ93I9r8vQr7NN_aju7MAdfrfE8rCyAb1zuVUvtSzTmPym-J3O_lrVnpfd_TsYeB6-dQ4E2lGXJCG1po1GyQ0SgkVGJcmdAoYMLNASB-JIAk1mxNMxWHLvD_kBOFU:1wuhQQ:HuV2HM9vpxafctqeR1Wz7ZnZYDqn4zOGLVhi5ELmbvk','2026-08-14 02:43:38.236810'),('09pew4m24rsdnyy0vvolhqgv6z8vnp82','.eJxVjEsOwjAMBe-SNYpKTOqaJXvOUDm2QwsokfpZIe4OlbqA7ZuZ93I9r8vQr7NN_aju7MAdfrfE8rCyAb1zuVUvtSzTmPym-J3O_lrVnpfd_TsYeB6-dQ4E2lGXJCG1po1GyQ0SgkVGJcmdAoYMLNASB-JIAk1mxNMxWHLvD_kBOFU:1wvcxQ:ENR_dhCXfiX6ei55fUVBD3ZwLwX6CuRDMluG9Kf7yPQ','2026-08-16 16:09:32.567561'),('0fazvofekj9mvphjale2f7gpz3egzu2y','.eJxVjEsOwjAMBe-SNYpKTOqaJXvOUDm2QwsokfpZIe4OlbqA7ZuZ93I9r8vQr7NN_aju7MAdfrfE8rCyAb1zuVUvtSzTmPym-J3O_lrVnpfd_TsYeB6-dQ4E2lGXJCG1po1GyQ0SgkVGJcmdAoYMLNASB-JIAk1mxNMxWHLvD_kBOFU:1wlWMY:RHV6oZP3d8qcgAmDt56gg0WBiUJUFeJ1vKoX3dGP5qE','2026-07-19 19:05:42.808350'),('1uhnxegw8zrok7lpxoq63mgebyn36qqk','.eJxVjEsOwjAMBe-SNYpKTOqaJXvOUDm2QwsokfpZIe4OlbqA7ZuZ93I9r8vQr7NN_aju7MAdfrfE8rCyAb1zuVUvtSzTmPym-J3O_lrVnpfd_TsYeB6-dQ4E2lGXJCG1po1GyQ0SgkVGJcmdAoYMLNASB-JIAk1mxNMxWHLvD_kBOFU:1wvGU2:cTA0O9rLYw1uVtxVDCVRWgQejhiP-Z1aGzgp7E62Hm8','2026-08-15 16:09:42.803754'),('2999idl0s2pn26qh26owjm5z5qzpvk4a','.eJxVjEEOwiAQRe_C2hCgZQCX7j0DGTqDVA0kpV0Z765NutDtf-_9l4i4rSVunZc4kzgLLU6_W8LpwXUHdMd6a3JqdV3mJHdFHrTLayN-Xg7376BgL9_a6GDd5DCrMXu0kABC9obCwCoYJIuOmGAYyRrGQE5lYK_JOvaQtBbvD-BAN-0:1wl4BY:Fg7M1NuxsjGHkqGaCmCQC_hxTtBeKiO2zj2vdOXAJ7U','2026-07-18 13:00:28.991018'),('2f3cvsammf9i0bv33ci2dfxouhexoxwu','.eJxVjEsOwjAMBe-SNYpKTOqaJXvOUDm2QwsokfpZIe4OlbqA7ZuZ93I9r8vQr7NN_aju7MAdfrfE8rCyAb1zuVUvtSzTmPym-J3O_lrVnpfd_TsYeB6-dQ4E2lGXJCG1po1GyQ0SgkVGJcmdAoYMLNASB-JIAk1mxNMxWHLvD_kBOFU:1ws9uM:dvE3DbBqp3j7Rv6s2n-PUfQkIDM-sNJ6odfVHm8WOjI','2026-08-07 02:32:02.615175'),('2gqtb6990sxhuxmm5f31dz8y27uufdle','.eJxVjEsOwjAMBe-SNYpKTOqaJXvOUDm2QwsokfpZIe4OlbqA7ZuZ93I9r8vQr7NN_aju7MAdfrfE8rCyAb1zuVUvtSzTmPym-J3O_lrVnpfd_TsYeB6-dQ4E2lGXJCG1po1GyQ0SgkVGJcmdAoYMLNASB-JIAk1mxNMxWHLvD_kBOFU:1wqGPF:CVKz201IYdH5qC7q3rTzjZeb7t5r49XYRLc5LleBPR8','2026-08-01 21:04:05.251486'),('2mv7mx3yvvhmprt82mj2g907ijbvjuju','.eJxVjEsOwjAMBe-SNYpKTOqaJXvOUDm2QwsokfpZIe4OlbqA7ZuZ93I9r8vQr7NN_aju7MAdfrfE8rCyAb1zuVUvtSzTmPym-J3O_lrVnpfd_TsYeB6-dQ4E2lGXJCG1po1GyQ0SgkVGJcmdAoYMLNASB-JIAk1mxNMxWHLvD_kBOFU:1wrOwr:y99r3o6hD9C-zPwO8emQngRsr4JkZs9uXcszIvu3o18','2026-08-05 00:23:29.732945'),('2tx8vcocxis2jx1ixxh3icjyhy058rri','.eJxVjEsOwjAMBe-SNYpKTOqaJXvOUDm2QwsokfpZIe4OlbqA7ZuZ93I9r8vQr7NN_aju7MAdfrfE8rCyAb1zuVUvtSzTmPym-J3O_lrVnpfd_TsYeB6-dQ4E2lGXJCG1po1GyQ0SgkVGJcmdAoYMLNASB-JIAk1mxNMxWHLvD_kBOFU:1wrf4B:UlsdZ4-TqLgh4OMJxCXGOLBR9cCvZgT3zKln0xmRK9g','2026-08-05 17:36:07.885267'),('5uymxmnf8t55k6pfhxqk1yfvempemeuf','.eJxVjEsOwjAMBe-SNYpKTOqaJXvOUDm2QwsokfpZIe4OlbqA7ZuZ93I9r8vQr7NN_aju7MAdfrfE8rCyAb1zuVUvtSzTmPym-J3O_lrVnpfd_TsYeB6-dQ4E2lGXJCG1po1GyQ0SgkVGJcmdAoYMLNASB-JIAk1mxNMxWHLvD_kBOFU:1wlZMH:LcFIS2UfZloIefmBO6aZxlrpLKewDasXM6OR31PHzMo','2026-07-19 22:17:37.857017'),('68m377f8s633r5aj0uz26rornqksup89','.eJxVjEsOwjAMBe-SNYpKTOqaJXvOUDm2QwsokfpZIe4OlbqA7ZuZ93I9r8vQr7NN_aju7MAdfrfE8rCyAb1zuVUvtSzTmPym-J3O_lrVnpfd_TsYeB6-dQ4E2lGXJCG1po1GyQ0SgkVGJcmdAoYMLNASB-JIAk1mxNMxWHLvD_kBOFU:1wwKJV:-AYnS8J8mZutz3z06JljqZv89kxaJ0cayTiiiV5Yeik','2026-08-18 14:27:13.698624'),('69l713rrypja5v1xk555bfy7a8833s14','.eJxVjEEOwiAQRe_C2hCgZQCX7j0DGTqDVA0kpV0Z765NutDtf-_9l4i4rSVunZc4kzgLLU6_W8LpwXUHdMd6a3JqdV3mJHdFHrTLayN-Xg7376BgL9_a6GDd5DCrMXu0kABC9obCwCoYJIuOmGAYyRrGQE5lYK_JOvaQtBbvD-BAN-0:1wl5MN:aJTlzc7tc4Hk2K0KZ8ys7UwQF46_l_bLJJvuIRaO-jE','2026-07-18 14:15:43.901379'),('6i4twposa4503cehptou6h0i5ukuqylh','.eJxVjEEOwiAQRe_C2hCgZQCX7j0DGTqDVA0kpV0Z765NutDtf-_9l4i4rSVunZc4kzgLLU6_W8LpwXUHdMd6a3JqdV3mJHdFHrTLayN-Xg7376BgL9_a6GDd5DCrMXu0kABC9obCwCoYJIuOmGAYyRrGQE5lYK_JOvaQtBbvD-BAN-0:1wgSGN:NnM4WETYeqY528iiKM9olXxgvhYctJW-BnZq6jZvSVQ','2026-07-19 19:12:23.513164'),('6i5km6o70eh5wm15xvp7rkxxdrtp4t0f','.eJxVjEEOwiAQRe_C2hCgZQCX7j0DGTqDVA0kpV0Z765NutDtf-_9l4i4rSVunZc4kzgLLU6_W8LpwXUHdMd6a3JqdV3mJHdFHrTLayN-Xg7376BgL9_a6GDd5DCrMXu0kABC9obCwCoYJIuOmGAYyRrGQE5lYK_JOvaQtBbvD-BAN-0:1wkWTG:RLeOR6CsTR2FCMZPk4VfWxGdGneUfyIXN69nqin9rao','2026-07-17 01:00:30.072184'),('6nhlft4pmac7fo7vpgtk31jocv9tu1a6','.eJxVjEEOwiAQRe_C2hCgZQCX7j0DGTqDVA0kpV0Z765NutDtf-_9l4i4rSVunZc4kzgLLU6_W8LpwXUHdMd6a3JqdV3mJHdFHrTLayN-Xg7376BgL9_a6GDd5DCrMXu0kABC9obCwCoYJIuOmGAYyRrGQE5lYK_JOvaQtBbvD-BAN-0:1wkWg3:dQxuODn4QLAp61J_sV_NgDPQaZ42BorJPWD32xpugJo','2026-07-17 01:13:43.734842'),('7c5oincggiszwp1umgtnv9t1bqkhyky4','.eJxVjEsOwjAMBe-SNYpKTOqaJXvOUDm2QwsokfpZIe4OlbqA7ZuZ93I9r8vQr7NN_aju7MAdfrfE8rCyAb1zuVUvtSzTmPym-J3O_lrVnpfd_TsYeB6-dQ4E2lGXJCG1po1GyQ0SgkVGJcmdAoYMLNASB-JIAk1mxNMxWHLvD_kBOFU:1wub4h:jHNQRQmXF6dJ0TMh08CwKTDrvhzU53dkEQAb7Z1PUUw','2026-08-13 19:56:47.857341'),('81zma67yh36952ahypdfa7pi09cannco','.eJxVjEsOwjAMBe-SNYpKTOqaJXvOUDm2QwsokfpZIe4OlbqA7ZuZ93I9r8vQr7NN_aju7MAdfrfE8rCyAb1zuVUvtSzTmPym-J3O_lrVnpfd_TsYeB6-dQ4E2lGXJCG1po1GyQ0SgkVGJcmdAoYMLNASB-JIAk1mxNMxWHLvD_kBOFU:1wlXo5:5_AtUB6KytK038lt1-LEL9T0gwvEnKmanHsfjJbAh-Y','2026-07-19 20:38:13.209964'),('8fzhgbd00asxtcpt3clpwnedq45hc30l','.eJxVjEEOwiAQRe_C2hCgZQCX7j0DGTqDVA0kpV0Z765NutDtf-_9l4i4rSVunZc4kzgLLU6_W8LpwXUHdMd6a3JqdV3mJHdFHrTLayN-Xg7376BgL9_a6GDd5DCrMXu0kABC9obCwCoYJIuOmGAYyRrGQE5lYK_JOvaQtBbvD-BAN-0:1wkVn8:7fwzd0w7ndYsx3w0eXjAxRdSATsSTMCqE9amRqZdFzU','2026-07-17 00:16:58.998841'),('8jmauhwdixv59kxshq7ekw2pq85cvwih','.eJxVjEsOwjAMBe-SNYpKTOqaJXvOUDm2QwsokfpZIe4OlbqA7ZuZ93I9r8vQr7NN_aju7MAdfrfE8rCyAb1zuVUvtSzTmPym-J3O_lrVnpfd_TsYeB6-dQ4E2lGXJCG1po1GyQ0SgkVGJcmdAoYMLNASB-JIAk1mxNMxWHLvD_kBOFU:1wrf3C:KbAyio_GBbZlQ3YcEJJBuFw_bJMSi764FgJGlg7BXzY','2026-08-05 17:35:06.703734'),('91tjwj4uoleesjriflwy6in34d7a6492','e30:1whTEL:I8mnkswCUj_bKBCbRKzAHzpE6SO16I-xCZStRz-3WVM','2026-07-22 14:26:29.487869'),('97ym4clbi1deum79mocjmwivmrgsw5n9','.eJxVjEsOwjAMBe-SNYpKTOqaJXvOUDm2QwsokfpZIe4OlbqA7ZuZ93I9r8vQr7NN_aju7MAdfrfE8rCyAb1zuVUvtSzTmPym-J3O_lrVnpfd_TsYeB6-dQ4E2lGXJCG1po1GyQ0SgkVGJcmdAoYMLNASB-JIAk1mxNMxWHLvD_kBOFU:1wlZxO:08M9eTYY0ViGwsftn-PhlPphiwjRMEYHEIuOoPKuVbA','2026-07-19 22:55:58.862612'),('dldmgfmk7sjl4w13fjpy0ytn1rifg0on','.eJxVjEEOwiAQRe_C2hCgZQCX7j0DGTqDVA0kpV0Z765NutDtf-_9l4i4rSVunZc4kzgLLU6_W8LpwXUHdMd6a3JqdV3mJHdFHrTLayN-Xg7376BgL9_a6GDd5DCrMXu0kABC9obCwCoYJIuOmGAYyRrGQE5lYK_JOvaQtBbvD-BAN-0:1wl5Xb:uIfJKsjgmrLVWz9vTa6hgTb6GqpXPUpImxCJ3mq3tHg','2026-07-18 14:27:19.949345'),('e336hip6m92rn7us5mt4yfy1h9omapa3','.eJxVjEsOwjAMBe-SNYpKTOqaJXvOUDm2QwsokfpZIe4OlbqA7ZuZ93I9r8vQr7NN_aju7MAdfrfE8rCyAb1zuVUvtSzTmPym-J3O_lrVnpfd_TsYeB6-dQ4E2lGXJCG1po1GyQ0SgkVGJcmdAoYMLNASB-JIAk1mxNMxWHLvD_kBOFU:1wrfUT:-6Aa1EMOP-RCpgU3h8qIJLNdoAT9bGwIk0DEES5TwCQ','2026-08-05 18:03:17.908077'),('efbdr1npsec33ybpzoiqd9yw1n5n0vnx','.eJxVjEsOwjAMBe-SNYpKTOqaJXvOUDm2QwsokfpZIe4OlbqA7ZuZ93I9r8vQr7NN_aju7MAdfrfE8rCyAb1zuVUvtSzTmPym-J3O_lrVnpfd_TsYeB6-dQ4E2lGXJCG1po1GyQ0SgkVGJcmdAoYMLNASB-JIAk1mxNMxWHLvD_kBOFU:1wvh7L:saE6Lv1FCJ0-aF_9xSr0DvJLpQClrnMQejVtg6pnp3Q','2026-08-16 20:36:03.764737'),('ehz3t4h7fe0uvsz4bd4zd723psc0v0yu','.eJxVjEsOwjAMBe-SNYpKTOqaJXvOUDm2QwsokfpZIe4OlbqA7ZuZ93I9r8vQr7NN_aju7MAdfrfE8rCyAb1zuVUvtSzTmPym-J3O_lrVnpfd_TsYeB6-dQ4E2lGXJCG1po1GyQ0SgkVGJcmdAoYMLNASB-JIAk1mxNMxWHLvD_kBOFU:1wpCoE:IqM8C8hilSlyEhAkMfsqFGuSq1-p9OcBlViapJq9VE8','2026-07-29 23:01:30.789568'),('fo71lx2dr9lyplr9gtu19n7zvur4gqjs','.eJxVjEsOwjAMBe-SNYpKTOqaJXvOUDm2QwsokfpZIe4OlbqA7ZuZ93I9r8vQr7NN_aju7MAdfrfE8rCyAb1zuVUvtSzTmPym-J3O_lrVnpfd_TsYeB6-dQ4E2lGXJCG1po1GyQ0SgkVGJcmdAoYMLNASB-JIAk1mxNMxWHLvD_kBOFU:1wrxv9:mpYHLTS2SM4e2Ydd1TpajzC2ELr7skSIIK72p9nBrC4','2026-08-06 13:44:03.122410'),('g6pd629pg42ef56m7wza3chdl9thgyja','.eJxVjEsOwjAMBe-SNYpKTOqaJXvOUDm2QwsokfpZIe4OlbqA7ZuZ93I9r8vQr7NN_aju7MAdfrfE8rCyAb1zuVUvtSzTmPym-J3O_lrVnpfd_TsYeB6-dQ4E2lGXJCG1po1GyQ0SgkVGJcmdAoYMLNASB-JIAk1mxNMxWHLvD_kBOFU:1wpC8t:KvYOSNnH1RZMqE-oQEKdJn2ySv-aYfWU_Lk6mRtTohA','2026-07-29 22:18:47.531745'),('gh4f40thcjx0yjiuewuhledap46pcd4g','.eJxVjEsOwjAMBe-SNYpKTOqaJXvOUDm2QwsokfpZIe4OlbqA7ZuZ93I9r8vQr7NN_aju7MAdfrfE8rCyAb1zuVUvtSzTmPym-J3O_lrVnpfd_TsYeB6-dQ4E2lGXJCG1po1GyQ0SgkVGJcmdAoYMLNASB-JIAk1mxNMxWHLvD_kBOFU:1wuhFg:8i9t_x535Ptg518UvYLA4bG_dFDCn_EBKs5ohTUhmf8','2026-08-14 02:32:32.989474'),('k8rs6k4k9lewkdc0eha4vpxr446b5ye9','.eJxVjEsOwjAMBe-SNYpKTOqaJXvOUDm2QwsokfpZIe4OlbqA7ZuZ93I9r8vQr7NN_aju7MAdfrfE8rCyAb1zuVUvtSzTmPym-J3O_lrVnpfd_TsYeB6-dQ4E2lGXJCG1po1GyQ0SgkVGJcmdAoYMLNASB-JIAk1mxNMxWHLvD_kBOFU:1wrNcI:FIYjSoCL0ojgfcQGw4KKsuLF7WycDeL6_sZrhpKWcFA','2026-08-04 22:58:10.378362'),('l5vjfjqhvvg0bza7xfx951f0zsj978v7','.eJxVjEsOwjAMBe-SNYpKTOqaJXvOUDm2QwsokfpZIe4OlbqA7ZuZ93I9r8vQr7NN_aju7MAdfrfE8rCyAb1zuVUvtSzTmPym-J3O_lrVnpfd_TsYeB6-dQ4E2lGXJCG1po1GyQ0SgkVGJcmdAoYMLNASB-JIAk1mxNMxWHLvD_kBOFU:1wvEka:nMYUnBgOkUeI30CrgHAPRQ2iTHhn2qoxqd52eb1HwsY','2026-08-15 14:18:40.007224'),('ltr3a4qam2k8bqbpofhshlo1flur655n','.eJxVjEEOwiAQRe_C2hCgZQCX7j0DGTqDVA0kpV0Z765NutDtf-_9l4i4rSVunZc4kzgLLU6_W8LpwXUHdMd6a3JqdV3mJHdFHrTLayN-Xg7376BgL9_a6GDd5DCrMXu0kABC9obCwCoYJIuOmGAYyRrGQE5lYK_JOvaQtBbvD-BAN-0:1whTML:s_kKF-DX6m9jbP639f2iRzYjkluWvNxj7m68UnOyvjM','2026-07-22 14:34:45.076564'),('lupz46sqi4ti8wdugvpfm7nuqv209ubw','.eJxVjEsOwjAMBe-SNYpKTOqaJXvOUDm2QwsokfpZIe4OlbqA7ZuZ93I9r8vQr7NN_aju7MAdfrfE8rCyAb1zuVUvtSzTmPym-J3O_lrVnpfd_TsYeB6-dQ4E2lGXJCG1po1GyQ0SgkVGJcmdAoYMLNASB-JIAk1mxNMxWHLvD_kBOFU:1wsiqj:ag0X33YoyFsWcLucuOw-0pGRHwHL7mtSuwI5xOjR_eU','2026-08-08 15:50:37.521264'),('myystf3waathl294v77cu3mbtt8aufdn','.eJxVjEsOwjAMBe-SNYpKTOqaJXvOUDm2QwsokfpZIe4OlbqA7ZuZ93I9r8vQr7NN_aju7MAdfrfE8rCyAb1zuVUvtSzTmPym-J3O_lrVnpfd_TsYeB6-dQ4E2lGXJCG1po1GyQ0SgkVGJcmdAoYMLNASB-JIAk1mxNMxWHLvD_kBOFU:1wvGSA:GnfP-7uPnanSJIvxw3f1orlNKtsW09r9F0hlbCpj2V0','2026-08-15 16:07:46.624276'),('nv6b6o1vzzf8qkehpa8cd7zjez0uj2xa','.eJxVjEsOwjAMBe-SNYpKTOqaJXvOUDm2QwsokfpZIe4OlbqA7ZuZ93I9r8vQr7NN_aju7MAdfrfE8rCyAb1zuVUvtSzTmPym-J3O_lrVnpfd_TsYeB6-dQ4E2lGXJCG1po1GyQ0SgkVGJcmdAoYMLNASB-JIAk1mxNMxWHLvD_kBOFU:1wriJa:C_RIkSQ2V2xZ3F_q6hKItapXcxwjEdf63TH7h_wu4kQ','2026-08-05 21:04:14.831300'),('podvyl064alsnc6y77s2wodl7enrkc91','.eJxVjEsOwjAMBe-SNYpKTOqaJXvOUDm2QwsokfpZIe4OlbqA7ZuZ93I9r8vQr7NN_aju7MAdfrfE8rCyAb1zuVUvtSzTmPym-J3O_lrVnpfd_TsYeB6-dQ4E2lGXJCG1po1GyQ0SgkVGJcmdAoYMLNASB-JIAk1mxNMxWHLvD_kBOFU:1wrFIY:ikoQvEOOd5LMxan6DJkmkHi8ZgRFOxU6BJRjTDj2Dt4','2026-08-04 14:05:14.755307'),('pwk9kgzgf3m56lxc6uz1on40cz4upnz3','.eJxVjEsOwjAMBe-SNYpKTOqaJXvOUDm2QwsokfpZIe4OlbqA7ZuZ93I9r8vQr7NN_aju7MAdfrfE8rCyAb1zuVUvtSzTmPym-J3O_lrVnpfd_TsYeB6-dQ4E2lGXJCG1po1GyQ0SgkVGJcmdAoYMLNASB-JIAk1mxNMxWHLvD_kBOFU:1wtSnl:IXCuHFPguC0S3yHRQpy0r9r5oh_zlX9N8KCn-Y4xlN8','2026-08-10 16:54:37.619892'),('qojvh37kgx5l9l108h8zg87g1bt38fwz','.eJxVjEsOwjAMBe-SNYpKTOqaJXvOUDm2QwsokfpZIe4OlbqA7ZuZ93I9r8vQr7NN_aju7MAdfrfE8rCyAb1zuVUvtSzTmPym-J3O_lrVnpfd_TsYeB6-dQ4E2lGXJCG1po1GyQ0SgkVGJcmdAoYMLNASB-JIAk1mxNMxWHLvD_kBOFU:1wrir2:A1hHkH3Bd7gdkPPADcWJC7clXzw1CmLBc6xj-02qSO4','2026-08-05 21:38:48.711206'),('qth7tybl6iaxn3hq7r7jvfzxast0cgca','.eJxVjEsOwjAMBe-SNYpKTOqaJXvOUDm2QwsokfpZIe4OlbqA7ZuZ93I9r8vQr7NN_aju7MAdfrfE8rCyAb1zuVUvtSzTmPym-J3O_lrVnpfd_TsYeB6-dQ4E2lGXJCG1po1GyQ0SgkVGJcmdAoYMLNASB-JIAk1mxNMxWHLvD_kBOFU:1wqfXd:Vms81NBFl8hlaUsVaMNQyroSA0-qKu7AezI_pIvRpUA','2026-08-02 23:54:25.359830'),('rdq03wwb5dmsm811o8xbmkdwg9oobidb','.eJxVjEsOwjAMBe-SNYpKTOqaJXvOUDm2QwsokfpZIe4OlbqA7ZuZ93I9r8vQr7NN_aju7MAdfrfE8rCyAb1zuVUvtSzTmPym-J3O_lrVnpfd_TsYeB6-dQ4E2lGXJCG1po1GyQ0SgkVGJcmdAoYMLNASB-JIAk1mxNMxWHLvD_kBOFU:1wqfZp:2NHaI6YUWWaDhPfsexAzZlHHcBaAuggR50QB48WsJ5Q','2026-08-02 23:56:41.637537'),('rwyvegkro7sp1h0mu8p4ib9c4l1ocwx6','.eJxVjEEOwiAQRe_C2hCgZQCX7j0DGTqDVA0kpV0Z765NutDtf-_9l4i4rSVunZc4kzgLLU6_W8LpwXUHdMd6a3JqdV3mJHdFHrTLayN-Xg7376BgL9_a6GDd5DCrMXu0kABC9obCwCoYJIuOmGAYyRrGQE5lYK_JOvaQtBbvD-BAN-0:1wkWYJ:0kNc91-CPMvBI7HpXq3FiMpJyKe8DwzLwjkAOld9MsE','2026-07-17 01:05:43.928834'),('t7xoymh5vjb0o7qh3kf3oglaqrpu5swa','.eJxVjEEOwiAQRe_C2hCgZQCX7j0DGTqDVA0kpV0Z765NutDtf-_9l4i4rSVunZc4kzgLLU6_W8LpwXUHdMd6a3JqdV3mJHdFHrTLayN-Xg7376BgL9_a6GDd5DCrMXu0kABC9obCwCoYJIuOmGAYyRrGQE5lYK_JOvaQtBbvD-BAN-0:1wl9qC:uQ5oLXU5EzpuZ_3GT838uW0C4NGNapQ4I0zLqH-sJFE','2026-07-18 19:02:48.814073'),('uohjezx2xcjrqk2higxzyetx7f6bx7jz','.eJxVjEsOwjAMBe-SNYpKTOqaJXvOUDm2QwsokfpZIe4OlbqA7ZuZ93I9r8vQr7NN_aju7MAdfrfE8rCyAb1zuVUvtSzTmPym-J3O_lrVnpfd_TsYeB6-dQ4E2lGXJCG1po1GyQ0SgkVGJcmdAoYMLNASB-JIAk1mxNMxWHLvD_kBOFU:1wvGRJ:R7vQrIfZD88DsYs6jcNwjgwh9CgJbLVd2mKfbbihZu4','2026-08-15 16:06:53.756013'),('usrrgnk8qb7dyu2d8l50h2hjq70ex9hh','.eJxVjEsOwjAMBe-SNYpKTOqaJXvOUDm2QwsokfpZIe4OlbqA7ZuZ93I9r8vQr7NN_aju7MAdfrfE8rCyAb1zuVUvtSzTmPym-J3O_lrVnpfd_TsYeB6-dQ4E2lGXJCG1po1GyQ0SgkVGJcmdAoYMLNASB-JIAk1mxNMxWHLvD_kBOFU:1wvGTH:ZF9lTi6NZufbyac6jDc9Fzawuu2aoIwyXtC2nxNgwQY','2026-08-15 16:08:55.675870'),('vujdhwct503810z78z5ncb3mc1qoqlrp','.eJxVjEsOwjAMBe-SNYpKTOqaJXvOUDm2QwsokfpZIe4OlbqA7ZuZ93I9r8vQr7NN_aju7MAdfrfE8rCyAb1zuVUvtSzTmPym-J3O_lrVnpfd_TsYeB6-dQ4E2lGXJCG1po1GyQ0SgkVGJcmdAoYMLNASB-JIAk1mxNMxWHLvD_kBOFU:1wpBlS:I0kRNsXQk1ywgbR67tS50VdUgi9Ggks-vPWdetn2-FY','2026-07-29 21:54:34.051953'),('wvcsgmwa538w3a9t8prc04dmcy37d6hd','.eJxVjEEOwiAQRe_C2hCgZQCX7j0DGTqDVA0kpV0Z765NutDtf-_9l4i4rSVunZc4kzgLLU6_W8LpwXUHdMd6a3JqdV3mJHdFHrTLayN-Xg7376BgL9_a6GDd5DCrMXu0kABC9obCwCoYJIuOmGAYyRrGQE5lYK_JOvaQtBbvD-BAN-0:1wl4kR:9h96M-iZ1pzbTjdi_cTuiRgMNxQy4HptyRfOmqRdSS4','2026-07-18 13:36:31.143329'),('yjnc4bm9pp1vjts5ve6p991iyugn2l3s','.eJxVjEsOwjAMBe-SNYpKTOqaJXvOUDm2QwsokfpZIe4OlbqA7ZuZ93I9r8vQr7NN_aju7MAdfrfE8rCyAb1zuVUvtSzTmPym-J3O_lrVnpfd_TsYeB6-dQ4E2lGXJCG1po1GyQ0SgkVGJcmdAoYMLNASB-JIAk1mxNMxWHLvD_kBOFU:1wvchQ:lo2kXrJ0OepgVq6H6TqNKVwlTLhAyQQKwkrVeXKmv_M','2026-08-16 15:53:00.861117'),('zoy4q5o3jd8e7ctc9v8fsuvmnvlvwc2o','.eJxVjEEOwiAQRe_C2hCgZQCX7j0DGTqDVA0kpV0Z765NutDtf-_9l4i4rSVunZc4kzgLLU6_W8LpwXUHdMd6a3JqdV3mJHdFHrTLayN-Xg7376BgL9_a6GDd5DCrMXu0kABC9obCwCoYJIuOmGAYyRrGQE5lYK_JOvaQtBbvD-BAN-0:1wl93V:GHl-MfI8og6HT2UREKNaRRIeLkLcNKZvNxFbXzgIKjE','2026-07-18 18:12:29.261416');
/*!40000 ALTER TABLE `django_session` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `evento_agenda`
--

DROP TABLE IF EXISTS `evento_agenda`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `evento_agenda` (
  `Id_Evento` int NOT NULL AUTO_INCREMENT,
  `Titulo` varchar(150) NOT NULL,
  `TipoEvento` varchar(20) NOT NULL,
  `Fecha` date NOT NULL,
  `Hora` time(6) NOT NULL,
  `Descripcion` longtext NOT NULL,
  `Estado` varchar(20) NOT NULL,
  `FechaCreacion` datetime(6) NOT NULL,
  `FechaActualizacion` datetime(6) NOT NULL,
  `CreadoPor` int DEFAULT NULL,
  `Id_Apiario` int NOT NULL,
  `Id_Colmena` int DEFAULT NULL,
  `Id_Responsable` int DEFAULT NULL,
  PRIMARY KEY (`Id_Evento`),
  KEY `evento_agenda_CreadoPor_64888e22_fk_auth_user_id` (`CreadoPor`),
  KEY `evento_agenda_Id_Apiario_17144cce_fk_apiario_Id_Apiario` (`Id_Apiario`),
  KEY `evento_agenda_Id_Colmena_73a8939f_fk_colmena_Id_Colmena` (`Id_Colmena`),
  KEY `evento_agenda_Id_Responsable_7998ef40_fk_apicultor_Id_Apicultor` (`Id_Responsable`),
  CONSTRAINT `evento_agenda_CreadoPor_64888e22_fk_auth_user_id` FOREIGN KEY (`CreadoPor`) REFERENCES `auth_user` (`id`),
  CONSTRAINT `evento_agenda_Id_Apiario_17144cce_fk_apiario_Id_Apiario` FOREIGN KEY (`Id_Apiario`) REFERENCES `apiario` (`Id_Apiario`),
  CONSTRAINT `evento_agenda_Id_Colmena_73a8939f_fk_colmena_Id_Colmena` FOREIGN KEY (`Id_Colmena`) REFERENCES `colmena` (`Id_Colmena`),
  CONSTRAINT `evento_agenda_Id_Responsable_7998ef40_fk_apicultor_Id_Apicultor` FOREIGN KEY (`Id_Responsable`) REFERENCES `apicultor` (`Id_Apicultor`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `evento_agenda`
--

LOCK TABLES `evento_agenda` WRITE;
/*!40000 ALTER TABLE `evento_agenda` DISABLE KEYS */;
/*!40000 ALTER TABLE `evento_agenda` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exportacion`
--

DROP TABLE IF EXISTS `exportacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exportacion` (
  `Id_Exportacion` int NOT NULL AUTO_INCREMENT,
  `Id_Administrador` int NOT NULL,
  `TipoExportacion` varchar(100) DEFAULT NULL,
  `FechaExportacion` date DEFAULT NULL,
  `Formato` varchar(50) DEFAULT NULL,
  `ArchivoGenerado` varchar(255) DEFAULT NULL,
  `Estado` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`Id_Exportacion`),
  KEY `Id_Administrador` (`Id_Administrador`),
  CONSTRAINT `exportacion_ibfk_1` FOREIGN KEY (`Id_Administrador`) REFERENCES `administrador` (`Id_Administrador`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exportacion`
--

LOCK TABLES `exportacion` WRITE;
/*!40000 ALTER TABLE `exportacion` DISABLE KEYS */;
/*!40000 ALTER TABLE `exportacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_reporte`
--

DROP TABLE IF EXISTS `historial_reporte`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historial_reporte` (
  `Id_Reporte` int NOT NULL AUTO_INCREMENT,
  `TipoReporte` varchar(50) NOT NULL,
  `Titulo` varchar(150) NOT NULL,
  `Formato` varchar(10) NOT NULL,
  `FechaDesde` date DEFAULT NULL,
  `FechaHasta` date DEFAULT NULL,
  `FiltrosAplicados` longtext NOT NULL,
  `TotalRegistros` int unsigned NOT NULL,
  `NombreArchivo` varchar(255) NOT NULL,
  `Archivo` varchar(100) NOT NULL,
  `TamanoBytes` bigint unsigned NOT NULL,
  `FechaGeneracion` datetime(6) NOT NULL,
  `UsuarioId` int DEFAULT NULL,
  PRIMARY KEY (`Id_Reporte`),
  KEY `historial_reporte_UsuarioId_cb9b3182_fk_auth_user_id` (`UsuarioId`),
  CONSTRAINT `historial_reporte_UsuarioId_cb9b3182_fk_auth_user_id` FOREIGN KEY (`UsuarioId`) REFERENCES `auth_user` (`id`),
  CONSTRAINT `historial_reporte_chk_1` CHECK ((`TotalRegistros` >= 0)),
  CONSTRAINT `historial_reporte_chk_2` CHECK ((`TamanoBytes` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_reporte`
--

LOCK TABLES `historial_reporte` WRITE;
/*!40000 ALTER TABLE `historial_reporte` DISABLE KEYS */;
INSERT INTO `historial_reporte` VALUES (1,'mantenimientos','Reporte de mantenimientos','pdf',NULL,NULL,'',3,'reporte-mantenimientos-20260729-213848.pdf','reportes/2026/07/reporte-mantenimientos-20260729-213848.pdf',116980,'2026-07-29 21:38:48.317339',3),(2,'mantenimientos','Reporte de mantenimientos','pdf','2026-07-01','2026-07-15','Desde: 01/07/2026 | Hasta: 15/07/2026',2,'reporte-mantenimientos-20260729-214128.pdf','reportes/2026/07/reporte-mantenimientos-20260729-214128.pdf',113833,'2026-07-29 21:41:28.309526',3),(3,'mantenimientos','Reporte de mantenimientos','pdf',NULL,NULL,'',4,'reporte-mantenimientos-20260729-214847.pdf','reportes/2026/07/reporte-mantenimientos-20260729-214847.pdf',121131,'2026-07-29 21:48:47.529737',3),(4,'mantenimientos','Reporte de mantenimientos','pdf',NULL,NULL,'',2,'reporte-mantenimientos-20260729-222923.pdf','reportes/2026/07/reporte-mantenimientos-20260729-222923.pdf',109147,'2026-07-29 22:29:23.725975',3),(5,'mantenimientos','Reporte de mantenimientos','pdf',NULL,NULL,'',3,'reporte-mantenimientos-20260804-133514.pdf','reportes/2026/08/reporte-mantenimientos-20260804-133514.pdf',112642,'2026-08-04 13:35:14.747893',3),(6,'mantenimientos','Reporte de mantenimientos','pdf',NULL,NULL,'',3,'reporte-mantenimientos-20260804-134656.pdf','reportes/2026/08/reporte-mantenimientos-20260804-134656.pdf',112572,'2026-08-04 13:46:56.966705',3),(7,'actividad_apicultores','Reporte de actividad de apicultores','pdf',NULL,NULL,'',3,'reporte-actividad-apicultores-20260804-221510.pdf','reportes/2026/08/reporte-actividad-apicultores-20260804-221510.pdf',148343,'2026-08-04 22:15:10.503372',3),(8,'mantenimientos','Reporte de mantenimientos','pdf',NULL,NULL,'',3,'reporte-mantenimientos-20260804-221802.pdf','reportes/2026/08/reporte-mantenimientos-20260804-221802.pdf',112567,'2026-08-04 22:18:02.770054',3),(9,'actividad_apicultores','Reporte de actividad de apicultores','pdf',NULL,NULL,'',3,'reporte-actividad-apicultores-20260804-172739.pdf','reportes/2026/08/reporte-actividad-apicultores-20260804-172739.pdf',148343,'2026-08-04 22:27:39.165656',3),(10,'estado_colmenas','Reporte de estado de colmenas','pdf',NULL,NULL,'',2,'reporte-estado-colmenas-20260804-185314.pdf','reportes/2026/08/reporte-estado-colmenas-20260804-185314.pdf',78341,'2026-08-04 23:53:14.608777',3),(11,'actividad_apicultores','Reporte de actividad de apicultores','pdf',NULL,NULL,'',3,'reporte-actividad-apicultores-20260805-112256.pdf','reportes/2026/08/reporte-actividad-apicultores-20260805-112256.pdf',24098,'2026-08-05 16:22:56.427274',3),(12,'actividad_apicultores','Reporte de actividad de apicultores','pdf',NULL,NULL,'',3,'reporte-actividad-apicultores-20260805-141434.pdf','reportes/2026/08/reporte-actividad-apicultores-20260805-141434.pdf',148340,'2026-08-05 19:14:34.662807',3),(13,'actividad_mensual','Reporte de actividad mensual - Enero de 2026','pdf','2026-01-01','2026-01-31','Desde: 01/01/2026 | Hasta: 31/01/2026',0,'reporte-actividad-mensual-20260805-145229.pdf','reportes/2026/08/reporte-actividad-mensual-20260805-145229.pdf',32998,'2026-08-05 19:52:29.372220',3),(14,'actividad_mensual','Reporte de actividad mensual - Julio de 2026','pdf','2026-07-01','2026-07-31','Desde: 01/07/2026 | Hasta: 31/07/2026',5,'reporte-actividad-mensual-20260805-150640.pdf','reportes/2026/08/reporte-actividad-mensual-20260805-150640.pdf',174081,'2026-08-05 20:06:40.378412',3),(15,'actividad_mensual','Reporte de actividad mensual - Febrero de 2026','pdf','2026-02-01','2026-02-28','Desde: 01/02/2026 | Hasta: 28/02/2026',0,'reporte-actividad-mensual-20260805-153109.pdf','reportes/2026/08/reporte-actividad-mensual-20260805-153109.pdf',31753,'2026-08-05 20:31:09.261317',3),(16,'comparativo','Reporte corporativo','pdf',NULL,NULL,'',0,'reporte-comparativo-20260805-155314.pdf','reportes/2026/08/reporte-comparativo-20260805-155314.pdf',8946,'2026-08-05 20:53:14.128359',3),(17,'comparativo','Reporte corporativo','pdf',NULL,NULL,'',5,'reporte-comparativo-20260805-160123.pdf','reportes/2026/08/reporte-comparativo-20260805-160123.pdf',8843,'2026-08-05 21:01:23.308669',3),(18,'comparativo','Reporte corporativo','pdf',NULL,NULL,'',5,'reporte-comparativo-20260805-160552.pdf','reportes/2026/08/reporte-comparativo-20260805-160552.pdf',44059,'2026-08-05 21:05:52.058711',3),(19,'estado_colmenas','Reporte de estado de colmenas','pdf',NULL,NULL,'',2,'reporte-estado-colmenas-20260808-113228.pdf','reportes/2026/08/reporte-estado-colmenas-20260808-113228.pdf',78209,'2026-08-08 16:32:28.198982',3),(20,'estado_colmenas','Reporte de estado de colmenas','pdf',NULL,NULL,'',2,'reporte-estado-colmenas-20260810-110554.pdf','reportes/2026/08/reporte-estado-colmenas-20260810-110554.pdf',78295,'2026-08-10 16:05:54.949179',3);
/*!40000 ALTER TABLE `historial_reporte` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `incidencia`
--

DROP TABLE IF EXISTS `incidencia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `incidencia` (
  `Id_Incidencia` int NOT NULL AUTO_INCREMENT,
  `Id_Apicultor` int DEFAULT NULL,
  `Id_Apiario` int DEFAULT NULL,
  `Id_Colmena` int DEFAULT NULL,
  `EntidadIncidencia` varchar(30) NOT NULL DEFAULT 'Colmena',
  `Titulo` varchar(100) DEFAULT NULL,
  `Prioridad` varchar(50) DEFAULT NULL,
  `FechaDeteccion` date DEFAULT NULL,
  `Estado` varchar(50) DEFAULT NULL,
  `Observaciones` varchar(255) DEFAULT NULL,
  `Imagen` varchar(255) DEFAULT NULL,
  `Responsable` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`Id_Incidencia`),
  KEY `Id_Colmena` (`Id_Colmena`),
  CONSTRAINT `incidencia_ibfk_1` FOREIGN KEY (`Id_Colmena`) REFERENCES `colmena` (`Id_Colmena`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `incidencia`
--

LOCK TABLES `incidencia` WRITE;
/*!40000 ALTER TABLE `incidencia` DISABLE KEYS */;
INSERT INTO `incidencia` VALUES (1,NULL,3,NULL,'Apiario','Colmenas Muertas','Crítica','2026-07-16','Pendiente','se murieron todas las colmenas','incidencias/WIN_20260806_08_09_17_Pro.jpg','Juan Velez'),(2,NULL,4,NULL,'Apiario','se murieron las colmenas','Crítica','2026-07-15','Resuelta','njjjkkkklljkhhh','incidencias/Gemini_Generated_Image_d2flc9d2flc9d2fl.png','Juan Herrera');
/*!40000 ALTER TABLE `incidencia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mantenimiento`
--

DROP TABLE IF EXISTS `mantenimiento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mantenimiento` (
  `Id_Mantenimiento` int NOT NULL AUTO_INCREMENT,
  `Id_Colmena` int DEFAULT NULL,
  `Id_Apiario` int DEFAULT NULL,
  `EntidadMantenimiento` varchar(50) DEFAULT NULL,
  `Tipo` varchar(100) DEFAULT NULL,
  `FechaEjecucion` date DEFAULT NULL,
  `Estado` varchar(50) DEFAULT NULL,
  `Prioridad` varchar(50) DEFAULT NULL,
  `Observaciones` varchar(255) DEFAULT NULL,
  `Responsable` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`Id_Mantenimiento`),
  KEY `Id_Colmena` (`Id_Colmena`),
  KEY `fk_mantenimiento_apiario` (`Id_Apiario`),
  CONSTRAINT `fk_mantenimiento_apiario` FOREIGN KEY (`Id_Apiario`) REFERENCES `apiario` (`Id_Apiario`),
  CONSTRAINT `mantenimiento_ibfk_1` FOREIGN KEY (`Id_Colmena`) REFERENCES `colmena` (`Id_Colmena`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mantenimiento`
--

LOCK TABLES `mantenimiento` WRITE;
/*!40000 ALTER TABLE `mantenimiento` DISABLE KEYS */;
INSERT INTO `mantenimiento` VALUES (2,1,NULL,'Colmena','Guadañar','2026-07-11','Completado','Baja','asdasdsa',NULL),(3,1,NULL,'Colmena','alimetar','2026-07-19','Completado','Media','alimentar y revisar','None'),(6,NULL,4,'Apiario','asdasd','2026-07-03','Pendiente','Media','asdasdasd',NULL);
/*!40000 ALTER TABLE `mantenimiento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `registro_laboral_mensual`
--

DROP TABLE IF EXISTS `registro_laboral_mensual`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registro_laboral_mensual` (
  `Id_RegistroLaboral` int NOT NULL AUTO_INCREMENT,
  `MesReporte` date NOT NULL,
  `DiasTrabajadosMes` smallint unsigned NOT NULL,
  `HorasTrabajadasMes` decimal(7,2) NOT NULL,
  `Observaciones` longtext NOT NULL,
  `FechaRegistro` datetime(6) NOT NULL,
  `FechaActualizacion` datetime(6) NOT NULL,
  `Id_Apicultor` int NOT NULL,
  PRIMARY KEY (`Id_RegistroLaboral`),
  UNIQUE KEY `uq_apicultor_mes_laboral` (`Id_Apicultor`,`MesReporte`),
  CONSTRAINT `registro_laboral_men_Id_Apicultor_f1d214a3_fk_apicultor` FOREIGN KEY (`Id_Apicultor`) REFERENCES `apicultor` (`Id_Apicultor`),
  CONSTRAINT `registro_laboral_mensual_chk_1` CHECK ((`DiasTrabajadosMes` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registro_laboral_mensual`
--

LOCK TABLES `registro_laboral_mensual` WRITE;
/*!40000 ALTER TABLE `registro_laboral_mensual` DISABLE KEYS */;
INSERT INTO `registro_laboral_mensual` VALUES (1,'2026-07-01',5,40.00,'este apicultor cumple con su respectivo tiempo de la semana','2026-07-19 20:56:23.660483','2026-07-19 20:56:39.809571',8);
/*!40000 ALTER TABLE `registro_laboral_mensual` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reporte`
--

DROP TABLE IF EXISTS `reporte`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reporte` (
  `Id_Reporte` int NOT NULL AUTO_INCREMENT,
  `Id_Apicultor` int NOT NULL,
  `FechaGeneracion` date DEFAULT NULL,
  `TipoReporte` varchar(100) DEFAULT NULL,
  `Contenido` varchar(255) DEFAULT NULL,
  `Formato` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`Id_Reporte`),
  KEY `Id_Apicultor` (`Id_Apicultor`),
  CONSTRAINT `reporte_ibfk_1` FOREIGN KEY (`Id_Apicultor`) REFERENCES `apicultor` (`Id_Apicultor`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reporte`
--

LOCK TABLES `reporte` WRITE;
/*!40000 ALTER TABLE `reporte` DISABLE KEYS */;
/*!40000 ALTER TABLE `reporte` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rol`
--

DROP TABLE IF EXISTS `rol`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rol` (
  `Id_Rol` int NOT NULL AUTO_INCREMENT,
  `NombreRol` varchar(50) NOT NULL,
  `Descripcion` varchar(255) DEFAULT NULL,
  `NivelAcceso` varchar(50) DEFAULT NULL,
  `Permisos` varchar(255) DEFAULT NULL,
  `EstadoActivo` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`Id_Rol`),
  UNIQUE KEY `uq_rol_nombre` (`NombreRol`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rol`
--

LOCK TABLES `rol` WRITE;
/*!40000 ALTER TABLE `rol` DISABLE KEYS */;
INSERT INTO `rol` VALUES (1,'Administrador','Usuario encargado de administrar el sistema','Alto','ag,agenda,av,cfg,cg,cv,ig,ir,mg,mr,perfil,rg,roles,rv,ug',1),(2,'Apicultor','Usuario encargado de apiarios y colmenas','Bajo','agenda,av,cv,ir,mr,perfil',1);
/*!40000 ALTER TABLE `rol` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seguimientoapicola`
--

DROP TABLE IF EXISTS `seguimientoapicola`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seguimientoapicola` (
  `Id_Seguimiento` int NOT NULL AUTO_INCREMENT,
  `EntidadSeguida` varchar(50) DEFAULT NULL,
  `Id_Apicultor` int DEFAULT NULL,
  `Id_Apiario` int DEFAULT NULL,
  `Id_Colmena` int DEFAULT NULL,
  `FechaRegistro` date DEFAULT NULL,
  `TipoSeguimiento` varchar(100) DEFAULT NULL,
  `Descripcion` varchar(255) DEFAULT NULL,
  `Responsable` varchar(100) DEFAULT NULL,
  `Estado` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`Id_Seguimiento`),
  KEY `Id_Apicultor` (`Id_Apicultor`),
  KEY `Id_Apiario` (`Id_Apiario`),
  KEY `Id_Colmena` (`Id_Colmena`),
  CONSTRAINT `seguimientoapicola_ibfk_1` FOREIGN KEY (`Id_Apicultor`) REFERENCES `apicultor` (`Id_Apicultor`),
  CONSTRAINT `seguimientoapicola_ibfk_2` FOREIGN KEY (`Id_Apiario`) REFERENCES `apiario` (`Id_Apiario`),
  CONSTRAINT `seguimientoapicola_ibfk_3` FOREIGN KEY (`Id_Colmena`) REFERENCES `colmena` (`Id_Colmena`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seguimientoapicola`
--

LOCK TABLES `seguimientoapicola` WRITE;
/*!40000 ALTER TABLE `seguimientoapicola` DISABLE KEYS */;
/*!40000 ALTER TABLE `seguimientoapicola` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vinculacion_apicultor`
--

DROP TABLE IF EXISTS `vinculacion_apicultor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vinculacion_apicultor` (
  `Id_Vinculacion` int NOT NULL AUTO_INCREMENT,
  `FechaIngreso` date NOT NULL,
  `Lunes` tinyint(1) NOT NULL,
  `Martes` tinyint(1) NOT NULL,
  `Miercoles` tinyint(1) NOT NULL,
  `Jueves` tinyint(1) NOT NULL,
  `Viernes` tinyint(1) NOT NULL,
  `Sabado` tinyint(1) NOT NULL,
  `Domingo` tinyint(1) NOT NULL,
  `FechaActualizacion` datetime(6) NOT NULL,
  `Id_Apicultor` int NOT NULL,
  PRIMARY KEY (`Id_Vinculacion`),
  UNIQUE KEY `Id_Apicultor` (`Id_Apicultor`),
  CONSTRAINT `vinculacion_apiculto_Id_Apicultor_75087464_fk_apicultor` FOREIGN KEY (`Id_Apicultor`) REFERENCES `apicultor` (`Id_Apicultor`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vinculacion_apicultor`
--

LOCK TABLES `vinculacion_apicultor` WRITE;
/*!40000 ALTER TABLE `vinculacion_apicultor` DISABLE KEYS */;
INSERT INTO `vinculacion_apicultor` VALUES (1,'2026-07-15',1,1,1,1,1,1,0,'2026-07-19 20:55:14.274844',8);
/*!40000 ALTER TABLE `vinculacion_apicultor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'dbmicolmena'
--

--
-- Dumping routines for database 'dbmicolmena'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-18  9:23:05
