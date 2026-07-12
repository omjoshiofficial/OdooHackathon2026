-- TransitOpsDB Schema

IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'TransitOpsDB')
    CREATE DATABASE TransitOpsDB;
GO

USE TransitOpsDB;
GO

CREATE TABLE IF NOT EXISTS Users (
    Id NVARCHAR(50) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Email NVARCHAR(150) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(256) NOT NULL,
    Role NVARCHAR(50) NOT NULL,
    Phone NVARCHAR(30),
    Department NVARCHAR(100),
    JoinedAt DATE,
    NotifEmail BIT DEFAULT 1,
    NotifPush BIT DEFAULT 1,
    NotifSms BIT DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETUTCDATE()
);

CREATE TABLE Vehicles (
    Id NVARCHAR(50) PRIMARY KEY,
    RegistrationNumber NVARCHAR(50) NOT NULL UNIQUE,
    Name NVARCHAR(100) NOT NULL,
    Model NVARCHAR(100),
    Type NVARCHAR(50),
    MaxLoadCapacity FLOAT,
    CurrentOdometer FLOAT,
    AcquisitionCost FLOAT,
    Status NVARCHAR(30) DEFAULT 'Available',
    CreatedAt DATETIME DEFAULT GETUTCDATE()
);

CREATE TABLE Drivers (
    Id NVARCHAR(50) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    LicenseNumber NVARCHAR(50) NOT NULL UNIQUE,
    LicenseCategory NVARCHAR(10),
    LicenseExpiry DATE,
    Phone NVARCHAR(30),
    SafetyScore INT DEFAULT 100,
    Status NVARCHAR(30) DEFAULT 'Available',
    CreatedAt DATETIME DEFAULT GETUTCDATE()
);

CREATE TABLE Trips (
    Id NVARCHAR(50) PRIMARY KEY,
    Source NVARCHAR(150),
    Destination NVARCHAR(150),
    VehicleId NVARCHAR(50),
    DriverId NVARCHAR(50),
    CargoWeight FLOAT,
    PlannedDistance FLOAT,
    Revenue FLOAT,
    Notes NVARCHAR(500),
    Status NVARCHAR(30) DEFAULT 'Draft',
    CreatedAt DATETIME DEFAULT GETUTCDATE(),
    CompletedAt DATETIME NULL
);

CREATE TABLE FuelLogs (
    Id NVARCHAR(50) PRIMARY KEY,
    VehicleId NVARCHAR(50),
    Date DATE,
    Liters FLOAT,
    PricePerLiter FLOAT,
    TotalCost FLOAT,
    Vendor NVARCHAR(150),
    Odometer FLOAT,
    Notes NVARCHAR(300),
    CreatedAt DATETIME DEFAULT GETUTCDATE()
);

CREATE TABLE Expenses (
    Id NVARCHAR(50) PRIMARY KEY,
    VehicleId NVARCHAR(50),
    TripId NVARCHAR(50) NULL,
    Type NVARCHAR(50),
    Amount FLOAT,
    Description NVARCHAR(300),
    Date DATE,
    CreatedAt DATETIME DEFAULT GETUTCDATE()
);

CREATE TABLE Maintenance (
    Id NVARCHAR(50) PRIMARY KEY,
    VehicleId NVARCHAR(50),
    Type NVARCHAR(100),
    Description NVARCHAR(500),
    Date DATE,
    Cost FLOAT,
    Status NVARCHAR(30) DEFAULT 'Open',
    CreatedAt DATETIME DEFAULT GETUTCDATE()
);
