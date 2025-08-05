
export const TIRE_BRANDS = [
  "Michelin",
  "Goodyear",
  "Bridgestone",
  "Pirelli",
  "Continental",
  "Other",
];

export const VEHICLE_MAKES = [
    "Acura",
    "Audi",
    "BMW",
    "Buick",
    "Cadillac",
    "Chevrolet",
    "Chrysler",
    "Dodge",
    "Ford",
    "GMC",
    "Honda",
    "Hyundai",
    "Infiniti",
    "Jaguar",
    "Jeep",
    "Kia",
    "Land Rover",
    "Lexus",
    "Lincoln",
    "Mazda",
    "Mercedes-Benz",
    "Nissan",
    "Ram",
    "Subaru",
    "Tesla",
    "Toyota",
    "Volkswagen",
    "Volvo",
    "Other"
];

export const VEHICLE_MODELS: { [key: string]: { [model: string]: string[] } } = {
    "Acura": {
        "ILX": ["Base", "Premium", "A-Spec", "Technology"],
        "TLX": ["Base", "Technology", "A-Spec", "Advance", "Type S"],
        "Integra": ["Base", "A-Spec", "A-Spec w/Technology", "Type S"],
        "MDX": ["Base", "Technology", "A-Spec", "Advance", "Type S"],
        "RDX": ["Base", "Technology", "A-Spec", "Advance"],
        "Other": []
    },
    "Audi": {
        "A3": ["Premium", "Premium Plus", "Prestige"],
        "A4": ["Premium", "Premium Plus", "Prestige"],
        "A5": ["Premium", "Premium Plus", "Prestige"],
        "A6": ["Premium", "Premium Plus", "Prestige"],
        "A7": ["Premium", "Premium Plus", "Prestige"],
        "A8": ["L"],
        "Q3": ["Premium", "Premium Plus"],
        "Q4 e-tron": ["Premium", "Premium Plus"],
        "Q5": ["Premium", "Premium Plus", "Prestige"],
        "Q7": ["Premium", "Premium Plus", "Prestige"],
        "Q8": ["Premium", "Premium Plus", "Prestige"],
        "e-tron GT": ["Premium Plus", "Prestige", "RS"],
        "Other": []
    },
    "BMW": {
        "2 Series": ["228i", "M235i", "230i", "M240i"],
        "3 Series": ["330i", "330e", "M340i", "M3"],
        "4 Series": ["430i", "440i", "M440i", "M4"],
        "5 Series": ["530i", "530e", "540i", "M550i", "M5"],
        "7 Series": ["740i", "750e", "760i", "i7"],
        "X1": ["xDrive28i"],
        "X2": ["xDrive28i", "M35i"],
        "X3": ["sDrive30i", "xDrive30i", "M40i", "M"],
        "X4": ["xDrive30i", "M40i", "M"],
        "X5": ["sDrive40i", "xDrive40i", "xDrive50e", "M60i", "M Competition"],
        "X6": ["xDrive40i", "M60i", "M Competition"],
        "X7": ["xDrive40i", "M60i", "Alpina XB7"],
        "Other": []
    },
    "Buick": {
        "Encore": ["Base", "Preferred"],
        "Encore GX": ["Preferred", "Select", "Essence"],
        "Envision": ["Preferred", "Essence", "Avenir"],
        "Enclave": ["Essence", "Premium", "Avenir"],
        "Other": []
    },
    "Cadillac": {
        "CT4": ["Luxury", "Premium Luxury", "Sport", "V-Series", "V-Series Blackwing"],
        "CT5": ["Luxury", "Premium Luxury", "Sport", "V-Series", "V-Series Blackwing"],
        "Escalade": ["Luxury", "Premium Luxury", "Sport", "Premium Luxury Platinum", "Sport Platinum", "V-Series"],
        "XT4": ["Luxury", "Premium Luxury", "Sport"],
        "XT5": ["Luxury", "Premium Luxury", "Sport"],
        "XT6": ["Luxury", "Premium Luxury", "Sport"],
        "Lyriq": ["Tech", "Luxury", "Sport"],
        "Other": []
    },
    "Chevrolet": {
        "Spark": ["LS", "1LT", "2LT", "Activ"],
        "Malibu": ["LS", "RS", "LT", "2LT"],
        "Camaro": ["1LT", "2LT", "3LT", "LT1", "1SS", "2SS", "ZL1"],
        "Corvette": ["Stingray", "Z06", "E-Ray"],
        "Trax": ["LS", "1RS", "LT", "2RS", "Activ"],
        "Trailblazer": ["LS", "LT", "RS", "Activ"],
        "Equinox": ["LS", "LT", "RS", "Premier"],
        "Blazer": ["2LT", "3LT", "RS", "Premier"],
        "Traverse": ["LS", "LT", "Z71", "RS"],
        "Tahoe": ["LS", "LT", "RST", "Z71", "Premier", "High Country"],
        "Suburban": ["LS", "LT", "RST", "Z71", "Premier", "High Country"],
        "Colorado": ["WT", "LT", "Trail Boss", "Z71", "ZR2"],
        "Silverado 1500": ["WT", "Custom", "LT", "RST", "Trail Boss", "LTZ", "High Country", "ZR2"],
        "Silverado 2500HD": ["WT", "Custom", "LT", "LTZ", "High Country"],
        "Silverado 3500HD": ["WT", "LT", "LTZ", "High Country"],
        "Silverado EV": ["WT", "RST"],
        "Other": []
    },
    "Chrysler": {
        "300": ["Touring", "Touring L", "300S"],
        "Pacifica": ["Touring", "Touring L", "Limited", "Pinnacle"],
        "Voyager": ["LX"],
        "Other": []
    },
    "Dodge": {
        "Hornet": ["GT", "R/T"],
        "Durango": ["SXT", "GT", "R/T", "Citadel", "SRT 392", "SRT Hellcat"],
        "Charger": ["SXT", "GT", "R/T", "Scat Pack", "SRT Hellcat"],
        "Challenger": ["SXT", "GT", "R/T", "R/T Scat Pack", "SRT Hellcat"],
        "Other": []
    },
    "Ford": {
        "Mustang": ["EcoBoost", "EcoBoost Premium", "GT", "GT Premium", "Dark Horse"],
        "Escape": ["Base", "Active", "ST-Line", "Platinum", "PHEV"],
        "Bronco Sport": ["Base", "Big Bend", "Heritage", "Outer Banks", "Badlands"],
        "Bronco": ["Base", "Big Bend", "Black Diamond", "Outer Banks", "Badlands", "Everglades", "Raptor"],
        "Edge": ["SE", "SEL", "ST-Line", "Titanium", "ST"],
        "Explorer": ["Base", "XLT", "ST-Line", "Timberline", "Limited", "ST", "King Ranch", "Platinum"],
        "Expedition": ["XL STX", "XLT", "Limited", "Timberline", "King Ranch", "Platinum"],
        "Maverick": ["XL", "XLT", "Lariat"],
        "Ranger": ["XL", "XLT", "Lariat", "Raptor"],
        "F-150": ["XL", "XLT", "Lariat", "King Ranch", "Platinum", "Tremor", "Raptor"],
        "F-150 Lightning": ["Pro", "XLT", "Flash", "Lariat", "Platinum"],
        "F-250 Super Duty": ["XL", "XLT", "Lariat", "King Ranch", "Platinum", "Limited"],
        "F-350 Super Duty": ["XL", "XLT", "Lariat", "King Ranch", "Platinum", "Limited"],
        "F-450 Super Duty": ["XL", "XLT", "Lariat", "King Ranch", "Platinum", "Limited"],
        "Other": []
    },
    "GMC": {
        "Terrain": ["SLE", "SLT", "AT4", "Denali"],
        "Acadia": ["Elevation", "AT4", "Denali"],
        "Yukon": ["SLE", "SLT", "AT4", "Denali", "Denali Ultimate"],
        "Canyon": ["Elevation", "AT4", "Denali", "AT4X"],
        "Sierra 1500": ["Pro", "SLE", "Elevation", "SLT", "AT4", "Denali", "AT4X", "Denali Ultimate"],
        "Sierra 2500HD": ["Pro", "SLE", "SLT", "AT4", "Denali", "AT4X"],
        "Sierra 3500HD": ["Pro", "SLE", "SLT", "AT4", "Denali", "AT4X"],
        "Hummer EV": ["EV2X", "EV3X"],
        "Other": []
    },
    "Honda": {
        "Civic": ["LX", "Sport", "EX", "Touring", "Si"],
        "Accord": ["LX", "EX", "Sport Hybrid", "EX-L Hybrid", "Sport-L Hybrid", "Touring Hybrid"],
        "HR-V": ["LX", "Sport", "EX-L"],
        "CR-V": ["LX", "EX", "Sport Hybrid", "EX-L", "Sport Touring Hybrid"],
        "Passport": ["EX-L", "TrailSport", "Black Edition"],
        "Pilot": ["LX", "Sport", "EX-L", "Touring", "TrailSport", "Elite"],
        "Odyssey": ["EX", "EX-L", "Sport", "Touring", "Elite"],
        "Ridgeline": ["Sport", "RTL", "TrailSport", "Black Edition"],
        "Prologue": ["EX", "Touring", "Elite"],
        "Other": []
    },
    "Hyundai": {
        "Elantra": ["SE", "SEL", "Limited", "N Line", "N"],
        "Sonata": ["SEL", "N Line"],
        "Venue": ["SE", "SEL", "Limited"],
        "Kona": ["SE", "SEL", "N Line", "Limited"],
        "Tucson": ["SE", "SEL", "XRT", "N Line", "Limited"],
        "Santa Fe": ["SE", "SEL", "XRT", "Limited", "Calligraphy"],
        "Palisade": ["SE", "SEL", "XRT", "Limited", "Calligraphy"],
        "Santa Cruz": ["SE", "SEL", "Night", "XRT", "Limited"],
        "Ioniq 5": ["SE Standard Range", "SE", "SEL", "Limited"],
        "Ioniq 6": ["SE Standard Range", "SE", "SEL", "Limited"],
        "Other": []
    },
    "Infiniti": {
        "Q50": ["Luxe", "Sensory", "Red Sport 400"],
        "QX50": ["Pure", "Luxe", "Sport", "Sensory", "Autograph"],
        "QX55": ["Luxe", "Essential", "Sensory"],
        "QX60": ["Pure", "Luxe", "Sensory", "Autograph"],
        "QX80": ["Luxe", "Premium Select", "Sensory"],
        "Other": []
    },
    "Jaguar": {
        "F-PACE": ["P250 R-Dynamic S", "P400 R-Dynamic S"],
        "E-PACE": ["P250 R-Dynamic SE"],
        "I-PACE": ["R-Dynamic HSE"],
        "F-TYPE": ["R-Dynamic", "75", "R75"],
        "XF": ["R-Dynamic SE"],
        "Other": []
    },
    "Jeep": {
        "Renegade": ["Latitude", "Upland", "Trailhawk"],
        "Compass": ["Sport", "Latitude", "Latitude Lux", "Limited", "Trailhawk"],
        "Cherokee": ["Altitude Lux", "Trailhawk"],
        "Grand Cherokee": ["Laredo", "Altitude", "Limited", "Overland", "Summit", "Summit Reserve"],
        "Wrangler": ["Sport", "Willys", "Sahara", "Rubicon", "Rubicon X", "Rubicon 392"],
        "Gladiator": ["Sport", "Willys", "Mojave", "Rubicon"],
        "Grand Wagoneer": ["Series I", "Series II", "Obsidian", "Series III"],
        "Other": []
    },
    "Kia": {
        "Forte": ["LX", "LXS", "GT-Line", "GT"],
        "K5": ["LXS FWD", "GT-Line FWD", "GT-Line AWD", "EX", "GT"],
        "Stinger": ["GT-Line", "GT2"],
        "Seltos": ["LX", "S", "EX", "X-Line", "SX"],
        "Sportage": ["LX", "EX", "X-Line AWD", "SX", "SX Prestige", "X-Pro"],
        "Sorento": ["LX", "S", "EX", "SX", "SX Prestige", "X-Line", "X-Pro"],
        "Carnival": ["LX", "EX", "SX", "SX Prestige"],
        "Telluride": ["LX", "S", "EX", "SX", "SX Prestige", "X-Line", "X-Pro"],
        "EV6": ["Wind", "GT-Line", "GT"],
        "EV9": ["Light", "Wind", "Land", "GT-Line"],
        "Other": []
    },
    "Land Rover": {
        "Range Rover Evoque": ["S", "Dynamic SE"],
        "Range Rover Velar": ["S", "Dynamic SE"],
        "Range Rover Sport": ["SE", "Dynamic SE", "Autobiography"],
        "Range Rover": ["SE", "Autobiography", "SV"],
        "Discovery Sport": ["S", "Dynamic SE"],
        "Discovery": ["S", "Dynamic SE"],
        "Defender": ["90", "110", "130"],
        "Other": []
    },
    "Lexus": {
        "IS": ["300", "350 F Sport Design", "350 F Sport", "500 F Sport Performance"],
        "ES": ["250 AWD", "350", "300h"],
        "LS": ["500", "500h"],
        "UX": ["250h", "250h F Sport Design", "250h F Sport Handling"],
        "NX": ["250", "350", "350h", "450h+"],
        "RX": ["350", "350h", "450h+", "500h F Sport Performance"],
        "TX": ["350", "550h+", "500h F Sport Performance"],
        "GX": ["550 Premium", "550 Overtrail", "550 Luxury"],
        "LX": ["600", "600 F Sport Handling", "600 Ultra Luxury"],
        "Other": []
    },
    "Lincoln": {
        "Corsair": ["Standard", "Reserve", "Grand Touring"],
        "Nautilus": ["Standard", "Reserve", "Black Label"],
        "Aviator": ["Standard", "Reserve", "Grand Touring", "Black Label"],
        "Navigator": ["Standard", "Reserve", "Black Label"],
        "Other": []
    },
    "Mazda": {
        "Mazda3": ["2.5 S", "2.5 S Select Sport", "2.5 S Preferred", "2.5 S Carbon Edition", "2.5 S Premium", "2.5 Carbon Turbo", "2.5 Turbo Premium Plus"],
        "CX-30": ["2.5 S", "2.5 S Select Sport", "2.5 S Preferred", "2.5 S Carbon Edition", "2.5 S Premium", "2.5 Carbon Turbo", "2.5 Turbo Premium Plus"],
        "CX-5": ["2.5 S Select", "2.5 S Preferred", "2.5 S Carbon Edition", "2.5 S Premium", "2.5 S Premium Plus", "2.5 Carbon Turbo", "2.5 Turbo Signature"],
        "CX-50": ["2.5 S Select", "2.5 S Preferred", "2.5 S Premium", "2.5 S Premium Plus", "2.5 Turbo", "2.5 Turbo Meridian Edition", "2.5 Turbo Premium", "2.5 Turbo Premium Plus"],
        "CX-90": ["Turbo Select", "Turbo Preferred", "Turbo Preferred Plus", "Turbo Premium", "Turbo Premium Plus", "Turbo S", "Turbo S Premium", "Turbo S Premium Plus"],
        "Other": []
    },
    "Mercedes-Benz": {
        "C-Class": ["C 300", "AMG C 43"],
        "E-Class": ["E 350", "E 450", "AMG E 53"],
        "S-Class": ["S 500", "S 580", "S 580e", "Maybach S 580"],
        "GLA": ["250", "AMG 35", "AMG 45"],
        "GLB": ["250", "AMG 35"],
        "GLC": ["300", "AMG 43"],
        "GLE": ["350", "450", "580", "AMG 53", "AMG 63 S"],
        "GLS": ["450", "580", "Maybach 600"],
        "EQB": ["250+", "300", "350"],
        "EQE": ["350+", "350 4MATIC", "500 4MATIC", "AMG EQE"],
        "EQS": ["450+", "450 4MATIC", "580 4MATIC"],
        "Other": []
    },
    "Nissan": {
        "Versa": ["S", "SV", "SR"],
        "Sentra": ["S", "SV", "SR"],
        "Altima": ["S", "SV", "SR", "SL", "SR VC-Turbo"],
        "Maxima": ["SV", "SR", "Platinum"],
        "Kicks": ["S", "SV", "SR"],
        "Rogue": ["S", "SV", "SL", "Platinum"],
        "Murano": ["SV", "Midnight Edition", "SL", "Platinum"],
        "Pathfinder": ["S", "SV", "SL", "Rock Creek", "Platinum"],
        "Armada": ["SV", "SL", "Midnight Edition", "Platinum"],
        "Frontier": ["S", "SV", "PRO-X", "PRO-4X"],
        "Titan": ["SV", "PRO-4X", "Platinum Reserve"],
        "Ariya": ["Engage", "Venture+", "Evolve+", "Empower+", "Platinum+"],
        "Other": []
    },
    "Ram": {
        "1500": ["Tradesman", "Big Horn", "Laramie", "Rebel", "Limited Longhorn", "Limited", "TRX"],
        "2500": ["Tradesman", "Big Horn", "Laramie", "Power Wagon", "Limited Longhorn", "Limited"],
        "3500": ["Tradesman", "Big Horn", "Laramie", "Limited Longhorn", "Limited"],
        "Other": []
    },
    "Subaru": {
        "Impreza": ["Base", "Sport", "RS"],
        "Legacy": ["Base", "Premium", "Sport", "Limited", "Touring XT"],
        "Crosstrek": ["Base", "Premium", "Sport", "Limited", "Wilderness"],
        "Forester": ["Base", "Premium", "Sport", "Wilderness", "Limited", "Touring"],
        "Outback": ["Base", "Premium", "Onyx Edition", "Limited", "Touring", "Onyx Edition XT", "Wilderness", "Limited XT", "Touring XT"],
        "Ascent": ["Base", "Premium", "Onyx Edition", "Limited", "Onyx Edition Limited", "Touring"],
        "Solterra": ["Premium", "Limited", "Touring"],
        "Other": []
    },
    "Tesla": {
        "Model 3": ["Rear-Wheel Drive", "Long Range", "Performance"],
        "Model Y": ["Rear-Wheel Drive", "Long Range", "Performance"],
        "Model S": ["Dual Motor", "Plaid"],
        "Model X": ["Dual Motor", "Plaid"],
        "Cybertruck": ["Rear-Wheel Drive", "All-Wheel Drive", "Cyberbeast"],
        "Other": []
    },
    "Toyota": {
        "Corolla": ["LE", "SE", "Nightshade", "XSE"],
        "Corolla Hatchback": ["SE", "Nightshade", "XSE"],
        "Camry": ["LE", "SE", "Nightshade", "XLE", "XSE", "TRD"],
        "Crown": ["XLE", "Limited", "Platinum"],
        "Prius": ["LE", "XLE", "Limited"],
        "RAV4": ["LE", "XLE", "XLE Premium", "Adventure", "TRD Off-Road", "Limited"],
        "Venza": ["LE", "XLE", "Nightshade Edition", "Limited"],
        "Highlander": ["LE", "XLE", "XSE", "Limited", "Platinum"],
        "Grand Highlander": ["XLE", "Limited", "Platinum", "MAX Limited", "MAX Platinum"],
        "4Runner": ["SR5", "TRD Sport", "SR5 Premium", "TRD Off-Road", "TRD Off-Road Premium", "Limited", "TRD Pro"],
        "Sequoia": ["SR5", "Limited", "Platinum", "TRD Pro", "Capstone"],
        "Tacoma": ["SR", "SR5", "TRD PreRunner", "TRD Sport", "TRD Off-Road", "Limited", "TRD Pro", "Trailhunter"],
        "Tundra": ["SR", "SR5", "Limited", "Platinum", "1794 Edition", "TRD Pro", "Capstone"],
        "bZ4X": ["XLE", "Limited"],
        "Other": []
    },
    "Volkswagen": {
        "Jetta": ["S", "Sport", "SE", "SEL"],
        "Taos": ["S", "SE", "SEL"],
        "Tiguan": ["S", "SE", "SE R-Line Black", "SEL R-Line"],
        "Atlas Cross Sport": ["SE", "SE with Technology", "SEL", "SEL R-Line", "SEL Premium R-Line"],
        "Atlas": ["SE", "SE with Technology", "Peak Edition SE", "SEL", "Peak Edition SEL", "SEL Premium R-Line"],
        "ID.4": ["Standard", "Pro", "Pro S", "Pro S Plus"],
        "Other": []
    },
    "Volvo": {
        "S60": ["Core", "Plus", "Ultimate"],
        "S90": ["Plus", "Ultimate"],
        "XC40": ["Core", "Plus", "Ultimate"],
        "XC60": ["Core", "Plus", "Ultimate"],
        "XC90": ["Core", "Plus", "Ultimate"],
        "C40 Recharge": ["Core", "Plus", "Ultimate"],
        "XC40 Recharge": ["Core", "Plus", "Ultimate"],
        "Other": []
    },
    "Other": {
        "Other": []
    }
};

export const COMMON_TIRE_SIZES = [
    "225/45R17",
    "215/55R17",
    "235/65R17",
    "205/55R16",
    "195/65R15",
    "245/45R18",
    "275/55R20",
    "265/70R17",
    "Other"
];
