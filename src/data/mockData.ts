export const DASHBOARD_STATS = [
    { title: "Total Incident", value: "46", change: "4.7%", trend: "up", icon: "📋" },
    { title: "Closed this Month", value: "8", change: "50%", trend: "neutral", icon: "✅" },
    { title: "Pending", value: "3", change: "33.3%", trend: "down", icon: "⏳" },
    { title: "Resolve", value: "5", change: "16.7%", trend: "neutral", icon: "🔧" },
] as const;

export const INCIDENT_TRENDS_DATA = [
    { name: 'Jan', total: 20, resolved: 12 },
    { name: 'Feb', total: 60, resolved: 40 },
    { name: 'Mar', total: 35, resolved: 25 },
    { name: 'Apr', total: 55, resolved: 40 },
    { name: 'May', total: 45, resolved: 30 },
    { name: 'Jun', total: 50, resolved: 35 },
    { name: 'Jul', total: 55, resolved: 40 },
    { name: 'Aug', total: 45, resolved: 30 },
    { name: 'Sep', total: 35, resolved: 25 },
    { name: 'Oct', total: 45, resolved: 30 },
    { name: 'Nov', total: 55, resolved: 40 },
    { name: 'Dec', total: 45, resolved: 30 },
];

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const CATEGORY_DATA = [
    { name: "Safety", value: 50, color: "#884616", pct: "50%" },
    { name: "Security", value: 30, color: "#F1E3D3", pct: "30%" },
    { name: "Environmental", value: 33.3, color: "#F8C947", pct: "33.3%" },
    { name: "Equipment", value: 16.7, color: "#BB8F53", pct: "16.7%" },
    { name: "Health", value: 20, color: "#FF4D4F", pct: "20%" },
];

export const REGIONAL_DISTRIBUTION = [
    { label: "GP", value: 55, color: "#884616" },
    { label: "WC", value: 45, color: "#25966A" },
    { label: "KZN", value: 35, color: "#3EB489" },
    { label: "EC", value: 30, color: "#66C2A5" },
    { label: "FS", value: 25, color: "#88D4BC" },
    { label: "LP", value: 20, color: "#B0E2D1" },
];

export const RECENT_INCIDENTS = [
    {
        refId: "INC-2025-0001",
        description: "Unauthorized access...",
        subTitle: "Unknown individual gain access.",
        type: "Security",
        severity: "Medium",
        status: "Open",
        date: "17-21 Jun 2035",
        assigned: "Thabo",
        location: "Free State Region"
    },
    {
        refId: "INC-2025-0001",
        description: "Unauthorized access...",
        subTitle: "Unknown individual gain access.",
        type: "Environmental",
        severity: "Critical",
        status: "Investigating",
        date: "17-21 Jun 2035",
        assigned: "Nerlson",
        location: "Free State Region"
    },
    {
        refId: "INC-2025-0001",
        description: "Unauthorized access...",
        subTitle: "Unknown individual gain access.",
        type: "Health",
        severity: "Critical",
        status: "Resolved",
        date: "17-21 Jun 2035",
        assigned: "Mbali",
        location: "Free State Region"
    },
    {
        refId: "INC-2025-0001",
        description: "Unauthorized access...",
        subTitle: "Unknown individual gain access.",
        type: "Safety",
        severity: "High",
        status: "Resolved",
        date: "17-21 Jun 2035",
        assigned: "Ndlovu",
        location: "Pretoria Region"
    },
    {
        refId: "INC-2025-0001",
        description: "Unauthorized access...",
        subTitle: "Unknown individual gain access.",
        type: "Equipment",
        severity: "Low",
        status: "Closed",
        date: "17-21 Jun 2035",
        assigned: "Sibusiso",
        location: "Capetown Region"
    },
    {
        refId: "INC-2025-0001",
        description: "Unauthorized access...",
        subTitle: "Unknown individual gain access.",
        type: "Security",
        severity: "Medium",
        status: "Investigating",
        date: "17-21 Jun 2035",
        assigned: "ETHAN",
        location: "Free State Region"
    },
    {
        refId: "INC-2025-0001",
        description: "Unauthorized access...",
        subTitle: "Unknown individual gain access.",
        type: "Health",
        severity: "Critical",
        status: "Resolved",
        date: "17-21 Jun 2035",
        assigned: "Thuso",
        location: "Free State Region"
    },
] as const;

export const INCIDENT_MANAGEMENT_STATS = [
    { label: "Open", count: "47", sub: "4.7% from last month", barColor: "bg-gold-500" },
    { label: "In progress", count: "23", sub: "-", barColor: "bg-blue-500" },
    { label: "Critical", count: "8", sub: "-", barColor: "bg-red-500" },
    { label: "Closed (MTD)", count: "156", sub: "-", barColor: "bg-gray-800" },
] as const;
