export const extractAccessToken = (cookieString: string): string | null => {
  const cookies = cookieString.split(';');

  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split('=');

    if (key === 'accessToken') {
      return value;
    }
  }

  return null;
};
