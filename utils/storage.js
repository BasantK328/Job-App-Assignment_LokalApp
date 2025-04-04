import AsyncStorage from '@react-native-async-storage/async-storage';

const BOOKMARKS_KEY = '@JobApp:bookmarks_v1'; 

export const saveBookmarks = async (bookmarks) => {
  if (!Array.isArray(bookmarks)) {
    console.error("saveBookmarks: Input must be an array.");
    return;
  }
  try {
    const jsonValue = JSON.stringify(bookmarks);
    await AsyncStorage.setItem(BOOKMARKS_KEY, jsonValue);
  } catch (e) {
    console.error('Failed to save bookmarks.', e);
  }
};

export const loadBookmarks = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(BOOKMARKS_KEY);
    const bookmarks = jsonValue != null ? JSON.parse(jsonValue) : [];
    return Array.isArray(bookmarks) ? bookmarks : [];
  } catch (e) {
    console.error('Failed to load bookmarks.', e);
    return []; 
  }
};