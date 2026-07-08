// mockSignals.ts - shared mock signals for development and demo purposes

export const defaultLocalSignals = [
  {
    id: "1",
    title: "Open Sewage Leak near Greenwood School",
    category: "Sanitation",
    status: "completed",
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Highway Underpass Light Malfunction",
    category: "Public Safety",
    status: "processing",
    created_at: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Water pipeline rupture - Market Main St",
    category: "Water Supply",
    status: "pending",
    created_at: new Date().toISOString(),
  },
];
