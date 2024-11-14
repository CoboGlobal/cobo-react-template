export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString();
};

export const formatAddress = (address: string | undefined): string => {
  if (!address) return 'N/A';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};