import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, Button, TouchableOpacity, ActivityIndicator,
  Alert, SafeAreaView, Image
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { loadBookmarks, saveBookmarks } from '../utils/storage';

const BookmarksScreen = () => {
  const [bookmarkedJobs, setBookmarkedJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const loadData = async () => {
        if(isActive) setIsLoading(true);
        try { const loaded = await loadBookmarks(); if (isActive) setBookmarkedJobs(loaded); }
        catch (e) { if(isActive) { console.error("Error loading bookmarks:", e); Alert.alert("Error", "Could not load bookmarks."); }}
        finally { if (isActive) setIsLoading(false); }
      };
      loadData(); return () => { isActive = false; };
    }, [])
  );

  const removeBookmark = useCallback(async (jobId) => {
    Alert.alert("Remove Bookmark", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: async () => {
          try { const updated = bookmarkedJobs.filter(j => j.id !== jobId); setBookmarkedJobs(updated); await saveBookmarks(updated); }
          catch (e) { Alert.alert("Error", "Could not remove bookmark."); }
      }},
    ]);
  }, [bookmarkedJobs]);

  const handleJobPress = useCallback((job) => {
    if (job && typeof job === 'object' && job.id != null) {
        navigation.navigate('JobsTab', { screen: 'JobDetails', params: { job } });
    } else {
        console.error("Attempted to navigate with invalid job data:", job);
        Alert.alert("Error", "Cannot view details for this item.");
    }
  }, [navigation]);

  const extractPhoneNumber = (link, whatsapp) => (link && link.startsWith('tel:')) ? link.substring(4) : (whatsapp || 'N/A');

  const BookmarkItem = React.memo(({ item }) => {
    if (!item || typeof item !== 'object' || item.id == null) {
        console.warn("Rendering BookmarkItem with invalid item:", item);
        return null; 
    }

    const phoneString = extractPhoneNumber(item.custom_link, item.whatsapp_no); 
    const locationString = item.primary_details?.Place || item.job_location_slug || 'N/A'; 
    let salaryString = 'N/A'; 
    if (item.salary_min != null && item.salary_max != null) salaryString = `₹${item.salary_min}-${item.salary_max}`;
    else if (item.primary_details?.Salary && item.primary_details.Salary !== '-') salaryString = String(item.primary_details.Salary); // Force string
    const titleString = item.title || 'No Title'; 
    const companyString = item.company_name || 'N/A'; 
    const imageUrl = item.creatives?.[0]?.thumb_url || item.creatives?.[0]?.file || null;

    return (
      <View style={styles.jobCardContainer}>
          {imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.logo} resizeMode="contain"/>
          ) : (
              <View style={[styles.logo, styles.placeholderLogo]}>
                  <Text style={styles.placeholderText}>Logo</Text>
              </View>
          )}
          <TouchableOpacity onPress={() => handleJobPress(item)} style={styles.jobCardContent}>
              <Text style={styles.title} numberOfLines={2}>{titleString}</Text>
              <Text style={styles.detailText}>Location: {locationString}</Text>
              <Text style={styles.detailText}>Salary: {salaryString}</Text>
              <Text style={styles.detailText}>Phone: {phoneString}</Text>
              <Text style={styles.companyText}>Company: {companyString}</Text>
          </TouchableOpacity>
          <View style={styles.buttonContainer}>
              <Button title="Remove" onPress={() => removeBookmark(item.id)} color="#FF3B30"/>
          </View>
      </View> 
    );
  });

  if (isLoading) return <ActivityIndicator size="large" style={styles.centered} color="#0000ff" />;
  if (!isLoading && bookmarkedJobs.length === 0) return <SafeAreaView style={styles.centered}><Text style={styles.emptyText}>No saved jobs yet.</Text><Text style={styles.emptySubText}>Save jobs from the Jobs tab!</Text></SafeAreaView>;

  return (
    <SafeAreaView style={styles.screen}>
      <FlatList
        data={bookmarkedJobs}
        renderItem={({ item }) => <BookmarkItem item={item} />} 
        keyExtractor={item => item && item.id != null ? item.id.toString() : Math.random().toString()}
        style={styles.list}
        contentContainerStyle={styles.listContentContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f0f0f0' }, centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f0f0f0' },
  list: { flex: 1 }, listContentContainer: { paddingBottom: 20, paddingTop: 8 },
  jobCardContainer: { marginVertical: 6, marginHorizontal: 12, backgroundColor: '#ffffff', borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 10, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  logo: { width: 60, height: 60, borderRadius: 8, marginRight: 12, backgroundColor: '#eee' }, placeholderLogo: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#e0e0e0' }, placeholderText: { fontSize: 10, color: '#888' },
  jobCardContent: { flex: 1, justifyContent: 'center' }, title: { fontSize: 16, fontWeight: '600', marginBottom: 4, color: '#333' }, detailText: { fontSize: 13, color: '#555', marginBottom: 2, lineHeight: 17 }, companyText: { fontSize: 12, color: '#777', marginTop: 3 },
  buttonContainer: { marginLeft: 10 }, emptyText: { fontSize: 18, fontWeight: 'bold', color: '#555', textAlign: 'center', marginBottom: 10 }, emptySubText: { fontSize: 14, color: '#777', textAlign: 'center' },
});
export default BookmarksScreen;