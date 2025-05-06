/**
 * Converts an ISO timestamp to a human-readable "time ago" format
 * @param {string} timestamp - ISO timestamp string
 * @returns {string} Human-readable time ago string (e.g., "2 hours ago")
 */
export function timeAgo(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    
    const secondsAgo = Math.floor((now - date) / 1000);
    
    // Less than a minute
    if (secondsAgo < 60) {
      return 'just now';
    }
    
    // Less than an hour
    if (secondsAgo < 3600) {
      const minutes = Math.floor(secondsAgo / 60);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    
    // Less than a day
    if (secondsAgo < 86400) {
      const hours = Math.floor(secondsAgo / 3600);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }
    
    // Less than a week
    if (secondsAgo < 604800) {
      const days = Math.floor(secondsAgo / 86400);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }
    
    // Less than a month
    if (secondsAgo < 2592000) {
      const weeks = Math.floor(secondsAgo / 604800);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    }
    
    // Less than a year
    if (secondsAgo < 31536000) {
      const months = Math.floor(secondsAgo / 2592000);
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    }
    
    // More than a year
    const years = Math.floor(secondsAgo / 31536000);
    return `${years} ${years === 1 ? 'year' : 'years'} ago`;
  }