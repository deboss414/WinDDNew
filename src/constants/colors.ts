interface Colors {
  background: string;
  text: string;
  secondaryText: string;
  primary: string;
  cardBackground: string;
  divider: string;
  success: string;
  error: string;
  taskStatus: {
    inProgress: string;
    completed: string;
    expired: string;
    closed: string;
  };
}

export const getColors = (colorScheme: 'light' | 'dark'): Colors => {
  return colorScheme === 'dark' 
    ? {
        background: '#121212',
        text: '#FFFFFF',
        secondaryText: '#A0A0A0',
        primary: '#2196F3',
        cardBackground: '#1E1E1E',
        divider: '#2C2C2C',
        success: '#4CAF50',
        error: '#F44336',
        taskStatus: {
          inProgress: '#FFA726',
          completed: '#4CAF50',
          expired: '#F44336',
          closed: '#9E9E9E',
        },
      }
    : {
        background: '#FFFFFF',
        text: '#000000',
        secondaryText: '#666666',
        primary: '#2196F3',
        cardBackground: '#F5F5F5',
        divider: '#E0E0E0',
        success: '#4CAF50',
        error: '#F44336',
        taskStatus: {
          inProgress: '#FFA726',
          completed: '#4CAF50',
          expired: '#F44336',
          closed: '#9E9E9E',
        },
      };
};
