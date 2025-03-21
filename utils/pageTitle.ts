const pageTitles: { [key: string]: string } = {
    '/': 'Home | AI Assistant',
    '/chat': 'Chat | AI Assistant',
    '/search': 'Search | AI Assistant',
    '/age': 'Age Predictor | AI Assistant'
  };
  
  export const getPageTitle = (path: string) => {
    return pageTitles[path] || 'AI Assistant';
  };
  