// Indian number format: 125000 → "₹1,25,000"
export function formatINR(amount: number): string {
  return '₹' + amount.toLocaleString('en-IN');
}

// DD MMM YYYY: "2025-04-01T16:36:32+05:30" → "01 Apr 2025"
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// Short relative time: "2 days ago", "just now"
export function timeAgo(iso: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(iso).getTime()) / 1000,
  );
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(months / 12);
  return `${years}y ago`;
}

// Repair-to-value recommendation
export function repairRecommendation(
  repairCost: number,
  unitPrice: number,
): 'Repair' | 'Monitor' | 'Replace' {
  const ratio = repairCost / unitPrice;
  if (ratio < 0.3) return 'Repair';
  if (ratio < 0.7) return 'Monitor';
  return 'Replace';
}

// Convert Excel serial date to ISO string
export function excelSerialToISO(serial: number): string {
  return new Date(
    Date.UTC(1899, 11, 30) + serial * 86400000,
  ).toISOString();
}
