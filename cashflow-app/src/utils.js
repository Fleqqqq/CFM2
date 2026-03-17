export const formatForInput = (value) => {
    if (value === 0) return '';
    if (value === null || value === undefined || value === '') return '';
    const num = Number(value);
    if (isNaN(num)) return '';
    // Use fi-FI locale for space as a thousand separator and comma as a decimal separator
    return new Intl.NumberFormat('fi-FI', { maximumFractionDigits: 20 }).format(num);
};

export const parseFromInput = (value) => {
    if (value === '') return 0;
    // Remove spaces and handle comma as a decimal separator
    const cleanedValue = String(value).replace(/\s/g, '').replace(',', '.');
    const parsed = parseFloat(cleanedValue);
    return isNaN(parsed) ? 0 : parsed;
};