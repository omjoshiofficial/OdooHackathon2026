using Microsoft.Data.SqlClient;

namespace TransitOpsBackend.Data
{
    public static class DbInitializer
    {
        public static void Initialize(IConfiguration config)
        {
            var connStr = config.GetConnectionString("DefaultConnection")!;
            using var conn = new SqlConnection(connStr);
            conn.Open();

            ExecuteNonQuery(conn, @"
                IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U')
                CREATE TABLE Users (
                    Id NVARCHAR(50) PRIMARY KEY,
                    Name NVARCHAR(100) NOT NULL,
                    Email NVARCHAR(150) NOT NULL,
                    PasswordHash NVARCHAR(256) NOT NULL,
                    Role NVARCHAR(50) NOT NULL,
                    Phone NVARCHAR(30),
                    Department NVARCHAR(100),
                    JoinedAt DATE,
                    NotifEmail BIT DEFAULT 1,
                    NotifPush BIT DEFAULT 1,
                    NotifSms BIT DEFAULT 0,
                    CreatedAt DATETIME DEFAULT GETUTCDATE()
                )");

            ExecuteNonQuery(conn, @"
                IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Vehicles' AND xtype='U')
                CREATE TABLE Vehicles (
                    Id NVARCHAR(50) PRIMARY KEY,
                    RegistrationNumber NVARCHAR(50) NOT NULL,
                    Name NVARCHAR(100) NOT NULL,
                    Model NVARCHAR(100),
                    Type NVARCHAR(50),
                    MaxLoadCapacity FLOAT,
                    CurrentOdometer FLOAT,
                    AcquisitionCost FLOAT,
                    Status NVARCHAR(30) DEFAULT 'Available',
                    CreatedAt DATETIME DEFAULT GETUTCDATE()
                )");

            ExecuteNonQuery(conn, @"
                IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Drivers' AND xtype='U')
                CREATE TABLE Drivers (
                    Id NVARCHAR(50) PRIMARY KEY,
                    Name NVARCHAR(100) NOT NULL,
                    LicenseNumber NVARCHAR(50) NOT NULL,
                    LicenseCategory NVARCHAR(10),
                    LicenseExpiry DATE,
                    Phone NVARCHAR(30),
                    SafetyScore INT DEFAULT 100,
                    Status NVARCHAR(30) DEFAULT 'Available',
                    CreatedAt DATETIME DEFAULT GETUTCDATE()
                )");

            ExecuteNonQuery(conn, @"
                IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Trips' AND xtype='U')
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
                )");

            ExecuteNonQuery(conn, @"
                IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='FuelLogs' AND xtype='U')
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
                )");

            ExecuteNonQuery(conn, @"
                IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Expenses' AND xtype='U')
                CREATE TABLE Expenses (
                    Id NVARCHAR(50) PRIMARY KEY,
                    VehicleId NVARCHAR(50),
                    TripId NVARCHAR(50) NULL,
                    Type NVARCHAR(50),
                    Amount FLOAT,
                    Description NVARCHAR(300),
                    Date DATE,
                    CreatedAt DATETIME DEFAULT GETUTCDATE()
                )");

            ExecuteNonQuery(conn, @"
                IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Maintenance' AND xtype='U')
                CREATE TABLE Maintenance (
                    Id NVARCHAR(50) PRIMARY KEY,
                    VehicleId NVARCHAR(50),
                    Type NVARCHAR(100),
                    Description NVARCHAR(500),
                    Date DATE,
                    Cost FLOAT,
                    Status NVARCHAR(30) DEFAULT 'Open',
                    CreatedAt DATETIME DEFAULT GETUTCDATE()
                )");

            SeedData(conn);
        }

        private static void SeedData(SqlConnection conn)
        {
            // Seed Users
            var userCount = (int)ExecuteScalar(conn, "SELECT COUNT(*) FROM Users");
            if (userCount == 0)
            {
                var users = new[]
                {
                    ("u0","Super Admin","admin@transitops.com","admin123","Super Admin","+1 (555) 000-0000","Administration","2020-01-01",1,1,1),
                    ("u1","Alex Morgan","alex@transitops.com","password","Fleet Manager","+1 (555) 001-0001","Operations","2022-01-15",1,1,0),
                    ("u2","Jordan Lee","jordan@transitops.com","password","Dispatcher","+1 (555) 001-0002","Dispatch","2022-03-20",1,0,1),
                    ("u3","Sam Rivera","sam@transitops.com","password","Safety Officer","+1 (555) 001-0003","Safety","2021-11-10",1,1,1),
                    ("u4","Taylor Kim","taylor@transitops.com","password","Financial Analyst","+1 (555) 001-0004","Finance","2023-02-01",0,1,0),
                };
                foreach (var u in users)
                    ExecuteNonQuery(conn, $"INSERT INTO Users VALUES ('{u.Item1}','{u.Item2}','{u.Item3}','{u.Item4}','{u.Item5}','{u.Item6}','{u.Item7}','{u.Item8}',{u.Item9},{u.Item10},{u.Item11},GETUTCDATE())");
            }

            // Seed Vehicles
            var vCount = (int)ExecuteScalar(conn, "SELECT COUNT(*) FROM Vehicles");
            if (vCount == 0)
            {
                var vehicles = new[]
                {
                    ("v1","TRK-001","Freightliner Alpha","Cascadia 2022","Truck",20000,145200,185000,"Available"),
                    ("v2","TRK-002","Kenworth Bravo","T680 2021","Truck",22000,210500,195000,"On Trip"),
                    ("v3","VAN-001","Ford Transit Charlie","Transit 2023","Van",3500,45000,42000,"Available"),
                    ("v4","BUS-001","Blue Bird Delta","Vision 2020","Bus",5000,320000,95000,"In Shop"),
                    ("v5","TRK-003","Peterbilt Echo","579 2022","Truck",25000,98000,210000,"Available"),
                    ("v6","TNK-001","Volvo Foxtrot","VNL 2021","Tanker",30000,175000,220000,"On Trip"),
                    ("v7","VAN-002","Mercedes Golf","Sprinter 2023","Van",4000,28000,55000,"Available"),
                    ("v8","TRK-004","Mack Hotel","Anthem 2019","Truck",18000,450000,160000,"Retired"),
                    ("v9","PKP-001","Toyota India","Hilux 2022","Pickup",1500,62000,38000,"Available"),
                    ("v10","TRL-001","Great Dane Juliet","Everest 2021","Trailer",35000,88000,75000,"Available"),
                };
                foreach (var v in vehicles)
                    ExecuteNonQuery(conn, $"INSERT INTO Vehicles VALUES ('{v.Item1}','{v.Item2}','{v.Item3}','{v.Item4}','{v.Item5}',{v.Item6},{v.Item7},{v.Item8},'{v.Item9}',GETUTCDATE())");
            }

            // Seed Drivers
            var dCount = (int)ExecuteScalar(conn, "SELECT COUNT(*) FROM Drivers");
            if (dCount == 0)
            {
                var drivers = new[]
                {
                    ("d1","Carlos Mendez","DL-TX-001234","CE","2026-05-15","+1 (555) 100-0001",95,"Available"),
                    ("d2","Maria Santos","DL-TX-002345","C","2025-11-20","+1 (555) 100-0002",88,"On Trip"),
                    ("d3","James Wilson","DL-TX-003456","CE","2024-03-10","+1 (555) 100-0003",72,"Available"),
                    ("d4","Priya Patel","DL-TX-004567","B","2026-08-30","+1 (555) 100-0004",98,"Off Duty"),
                    ("d5","Robert Chen","DL-TX-005678","CE","2025-06-12","+1 (555) 100-0005",91,"On Trip"),
                    ("d6","Lisa Thompson","DL-TX-006789","C","2023-12-01","+1 (555) 100-0006",65,"Suspended"),
                    ("d7","Ahmed Hassan","DL-TX-007890","CE","2027-02-28","+1 (555) 100-0007",94,"Available"),
                    ("d8","Sofia Garcia","DL-TX-008901","D","2026-09-15","+1 (555) 100-0008",87,"Available"),
                };
                foreach (var d in drivers)
                    ExecuteNonQuery(conn, $"INSERT INTO Drivers VALUES ('{d.Item1}','{d.Item2}','{d.Item3}','{d.Item4}','{d.Item5}','{d.Item6}',{d.Item7},'{d.Item8}',GETUTCDATE())");
            }

            // Seed Trips
            var tCount = (int)ExecuteScalar(conn, "SELECT COUNT(*) FROM Trips");
            if (tCount == 0)
            {
                ExecuteNonQuery(conn, "INSERT INTO Trips VALUES ('t1','Dallas, TX','Houston, TX','v2','d2',15000,240,3200,'Fragile cargo','Dispatched','2024-01-15',NULL)");
                ExecuteNonQuery(conn, "INSERT INTO Trips VALUES ('t2','Houston, TX','San Antonio, TX','v6','d5',28000,197,4100,'Fuel tanker delivery','Dispatched','2024-01-15',NULL)");
                ExecuteNonQuery(conn, "INSERT INTO Trips VALUES ('t3','Austin, TX','El Paso, TX','v1','d1',18000,580,7800,'','Completed','2024-01-10','2024-01-12')");
                ExecuteNonQuery(conn, "INSERT INTO Trips VALUES ('t4','Fort Worth, TX','Lubbock, TX','v5','d7',22000,320,4500,'Refrigerated goods','Completed','2024-01-08','2024-01-09')");
                ExecuteNonQuery(conn, "INSERT INTO Trips VALUES ('t5','San Antonio, TX','Corpus Christi, TX','v3','d4',2800,143,1800,'','Draft','2024-01-16',NULL)");
                ExecuteNonQuery(conn, "INSERT INTO Trips VALUES ('t6','Dallas, TX','Amarillo, TX','v9','d8',1200,360,2200,'','Cancelled','2024-01-05',NULL)");
                ExecuteNonQuery(conn, "INSERT INTO Trips VALUES ('t7','Houston, TX','Beaumont, TX','v7','d3',3200,85,1100,'','Completed','2024-01-12','2024-01-12')");
                ExecuteNonQuery(conn, "INSERT INTO Trips VALUES ('t8','El Paso, TX','Midland, TX','v10','d1',30000,290,5600,'Heavy machinery','Completed','2024-01-03','2024-01-04')");
            }

            // Seed FuelLogs
            var fCount = (int)ExecuteScalar(conn, "SELECT COUNT(*) FROM FuelLogs");
            if (fCount == 0)
            {
                ExecuteNonQuery(conn, "INSERT INTO FuelLogs VALUES ('f1','v1','2024-01-15',450,1.05,472.5,'Shell Station #42',145200,'',GETUTCDATE())");
                ExecuteNonQuery(conn, "INSERT INTO FuelLogs VALUES ('f2','v2','2024-01-14',520,1.02,530.4,'Pilot Flying J',210500,'DEF added',GETUTCDATE())");
                ExecuteNonQuery(conn, "INSERT INTO FuelLogs VALUES ('f3','v5','2024-01-13',480,1.08,518.4,'Love''s Travel Stop',98000,'',GETUTCDATE())");
                ExecuteNonQuery(conn, "INSERT INTO FuelLogs VALUES ('f4','v6','2024-01-12',600,1.03,618,'TA Travel Center',175000,'Full tank',GETUTCDATE())");
                ExecuteNonQuery(conn, "INSERT INTO FuelLogs VALUES ('f5','v3','2024-01-11',120,1.12,134.4,'BP Station',45000,'',GETUTCDATE())");
                ExecuteNonQuery(conn, "INSERT INTO FuelLogs VALUES ('f6','v7','2024-01-10',95,1.15,109.25,'Chevron',28000,'',GETUTCDATE())");
                ExecuteNonQuery(conn, "INSERT INTO FuelLogs VALUES ('f7','v9','2024-01-09',65,1.18,76.7,'ExxonMobil',62000,'',GETUTCDATE())");
                ExecuteNonQuery(conn, "INSERT INTO FuelLogs VALUES ('f8','v1','2024-01-08',430,1.04,447.2,'Shell Station #42',144800,'',GETUTCDATE())");
            }

            // Seed Expenses
            var eCount = (int)ExecuteScalar(conn, "SELECT COUNT(*) FROM Expenses");
            if (eCount == 0)
            {
                ExecuteNonQuery(conn, "INSERT INTO Expenses VALUES ('e1','v4',NULL,'Maintenance',8500,'Engine overhaul','2024-01-10',GETUTCDATE())");
                ExecuteNonQuery(conn, "INSERT INTO Expenses VALUES ('e2','v1','t3','Fuel',472.5,'Fuel fill-up Dallas','2024-01-15',GETUTCDATE())");
                ExecuteNonQuery(conn, "INSERT INTO Expenses VALUES ('e3','v2','t1','Toll',45,'Highway tolls','2024-01-15',GETUTCDATE())");
                ExecuteNonQuery(conn, "INSERT INTO Expenses VALUES ('e4','v5','t4','Parking',120,'Overnight parking Lubbock','2024-01-09',GETUTCDATE())");
                ExecuteNonQuery(conn, "INSERT INTO Expenses VALUES ('e5','v6','t2','Fuel',618,'Fuel fill-up Houston','2024-01-12',GETUTCDATE())");
                ExecuteNonQuery(conn, "INSERT INTO Expenses VALUES ('e6','v1',NULL,'Insurance',2400,'Monthly insurance premium','2024-01-01',GETUTCDATE())");
                ExecuteNonQuery(conn, "INSERT INTO Expenses VALUES ('e7','v3',NULL,'Repair',1200,'AC compressor','2024-01-16',GETUTCDATE())");
                ExecuteNonQuery(conn, "INSERT INTO Expenses VALUES ('e8','v7','t7','Misc',85,'Driver meal allowance','2024-01-12',GETUTCDATE())");
            }

            // Seed Maintenance
            var mCount = (int)ExecuteScalar(conn, "SELECT COUNT(*) FROM Maintenance");
            if (mCount == 0)
            {
                ExecuteNonQuery(conn, "INSERT INTO Maintenance VALUES ('m1','v4','Engine Repair','Major engine overhaul required','2024-01-10',8500,'Open',GETUTCDATE())");
                ExecuteNonQuery(conn, "INSERT INTO Maintenance VALUES ('m2','v1','Oil Change','Routine oil and filter change','2024-01-05',250,'Closed',GETUTCDATE())");
                ExecuteNonQuery(conn, "INSERT INTO Maintenance VALUES ('m3','v2','Tire Replacement','Replace all 18 tires','2023-12-20',4200,'Closed',GETUTCDATE())");
                ExecuteNonQuery(conn, "INSERT INTO Maintenance VALUES ('m4','v5','Brake Service','Front brake pads and rotors','2024-01-08',1800,'Closed',GETUTCDATE())");
                ExecuteNonQuery(conn, "INSERT INTO Maintenance VALUES ('m5','v6','General Inspection','Annual DOT inspection','2024-01-14',350,'Closed',GETUTCDATE())");
                ExecuteNonQuery(conn, "INSERT INTO Maintenance VALUES ('m6','v3','AC Service','AC compressor replacement','2024-01-16',1200,'Open',GETUTCDATE())");
            }
        }

        private static void ExecuteNonQuery(SqlConnection conn, string sql)
        {
            using var cmd = new SqlCommand(sql, conn);
            cmd.ExecuteNonQuery();
        }

        private static object ExecuteScalar(SqlConnection conn, string sql)
        {
            using var cmd = new SqlCommand(sql, conn);
            return cmd.ExecuteScalar()!;
        }
    }
}
