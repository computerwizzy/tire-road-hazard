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
        "ILX": ["Base", "Premium", "A-Spec"],
        "TLX": ["Base", "Technology", "A-Spec", "Advance"],
        "RLX": ["Base", "Sport Hybrid"],
        "MDX": ["Base", "Technology", "A-Spec", "Advance"],
        "RDX": ["Base", "Technology", "A-Spec", "Advance"]
    },
    "Audi": {
        "A3": ["Premium", "Premium Plus", "Prestige"],
        "A4": ["Premium", "Premium Plus", "Prestige"],
        "A6": ["Premium", "Premium Plus", "Prestige"],
        "A8": ["L"],
        "Q3": ["Premium", "Premium Plus"],
        "Q5": ["Premium", "Premium Plus", "Prestige"],
        "Q7": ["Premium", "Premium Plus", "Prestige"]
    },
    "BMW": {
        "3 Series": ["330i", "340i", "M340i"],
        "5 Series": ["530i", "540i", "M550i"],
        "7 Series": ["740i", "750i"],
        "X1": ["sDrive28i", "xDrive28i"],
        "X3": ["sDrive30i", "xDrive30i", "M40i"],
        "X5": ["sDrive40i", "xDrive40i", "M50i"]
    },
    "Chevrolet": {
        "Silverado": ["WT", "LT", "RST", "LTZ", "High Country"],
        "Equinox": ["L", "LS", "LT", "Premier"],
        "Malibu": ["L", "LS", "RS", "LT", "Premier"],
    },
    "Ford": {
        "F-150": ["XL", "XLT", "Lariat", "King Ranch", "Platinum", "Limited"],
        "Explorer": ["Base", "XLT", "Limited", "ST", "Platinum"],
        "Escape": ["S", "SE", "SEL", "Titanium"]
    },
    "Honda": {
        "Civic": ["LX", "Sport", "EX", "Touring", "Si"],
        "Accord": ["LX", "Sport", "EX-L", "Touring"],
        "CR-V": ["LX", "EX", "EX-L", "Touring"]
    },
    "Toyota": {
        "Camry": ["L", "LE", "SE", "XLE", "XSE", "TRD"],
        "Corolla": ["L", "LE", "SE", "XLE", "XSE"],
        "RAV4": ["LE", "XLE", "XLE Premium", "Adventure", "Limited", "TRD Off-Road"],
        "Tacoma": ["SR", "SR5", "TRD Sport", "TRD Off-Road", "Limited", "TRD Pro"]
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
