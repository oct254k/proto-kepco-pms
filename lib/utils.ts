export const formatAmount = (n: number): string => n.toLocaleString('ko-KR') + '원';

export const formatAmountShort = (n: number): string => {
  if (n >= 100000000) return (n / 100000000).toFixed(1) + '억';
  if (n >= 10000) return (n / 10000).toFixed(0) + '만';
  return n.toLocaleString('ko-KR');
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '-';
  return dateStr.substring(0, 10);
};

export const calcDday = (dateStr: string): number => {
  if (!dateStr) return 9999;
  const target = new Date(dateStr);
  const today = new Date();
  const diff = Math.floor((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
};

export const formatDday = (dateStr: string): string => {
  const d = calcDday(dateStr);
  if (d === 9999) return '-';
  if (d < 0) return `D+${Math.abs(d)}`;
  if (d === 0) return 'D-Day';
  return `D-${d}`;
};

export const calcAchievementRate = (actual: number, target: number): number => {
  if (target === 0) return 0;
  return Math.round((actual / target) * 100);
};
