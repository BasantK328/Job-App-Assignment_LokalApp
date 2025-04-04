import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Button,
  Alert,
  SafeAreaView,
  Image 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { saveBookmarks, loadBookmarks } from '../utils/storage'; 

const API_ENDPOINT = 'https://testapi.getlokalapp.com/common/jobs';

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/80.png?text=No+Image'; 

const JobsScreen = () => {
  const navigation = useNavigation();
  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMoreJobs, setHasMoreJobs] = useState(true);
  const [bookmarks, setBookmarks] = useState([]);

  const fetchJobs = async (pageNum = 1, refreshing = false) => {
    if ((isLoading || isLoadingMore) && !refreshing) return;
    if (!hasMoreJobs && pageNum > 1 && !refreshing) {
      console.log("No more jobs to load.");
      return;
    }

    console.log(`Fetching page ${pageNum}...`);
    if (pageNum > 1) setIsLoadingMore(true); else setIsLoading(true);
    if (pageNum === 1 || refreshing) setError(null);

    try {
      const response = await fetch(`${API_ENDPOINT}?page=${pageNum}`);
      if (!response.ok) {
         if (response.status === 404) throw new Error("Jobs API endpoint not found (404).");
         if (response.status >= 500) throw new Error(`Server error (${response.status}). Please try again later.`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const results = data?.results || [];
      const fetchedJobs = results.filter(item => item && typeof item.id === 'number');

      console.log(`API returned ${results.length} items, Filtered down to ${fetchedJobs.length} valid jobs.`);

      if (fetchedJobs.length > 0) {
        setJobs(prevJobs => (pageNum === 1 || refreshing) ? fetchedJobs : [...prevJobs, ...fetchedJobs]);
        setPage(pageNum);
        setHasMoreJobs(true);
      } else {
         if (results.length === 0) {
             setHasMoreJobs(false);
             console.log("No more items found from API.");
         } else {
             console.log("Current page had items, but no valid jobs. Will attempt next page if requested.");
         }
         if (pageNum === 1 || refreshing) {
             setJobs([]);
         }
      }
    } catch (e) {
      console.error("Failed to fetch jobs:", e);
      setError(e.message || "Failed to fetch jobs. Please check connection and try again.");
      setHasMoreJobs(true);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

   const loadInitialBookmarks = async () => {
      const loaded = await loadBookmarks();
      setBookmarks(loaded);
    };

    useEffect(() => {
      loadInitialBookmarks();
      fetchJobs(1, true);
    }, []);

    const toggleBookmark = useCallback(async (job) => {
      if (!job || typeof job.id !== 'number') {
        console.error("Cannot bookmark invalid item:", job);
        Alert.alert("Error", "Cannot save this item.");
        return;
      }
      let updatedBookmarks = [];
      const isCurrentlyBookmarked = bookmarks.some(b => b.id === job.id);

      if (isCurrentlyBookmarked) {
        updatedBookmarks = bookmarks.filter(b => b.id !== job.id);
      } else {
        updatedBookmarks = [...bookmarks, job];
      }
      setBookmarks(updatedBookmarks);
      await saveBookmarks(updatedBookmarks);
    }, [bookmarks]);

    const handleJobPress = useCallback((job) => {
      navigation.navigate('JobDetails', { job: job });
    }, [navigation]);

  const extractPhoneNumber = (link, whatsappNum) => {
    if (link && link.startsWith('tel:')) {
      return link.substring(4);
    }
    return whatsappNum || 'N/A';
  };

  const JobItem = React.memo(({ item }) => {
    const isBookmarked = bookmarks.some(b => b.id === item.id);
    const phoneNumber = extractPhoneNumber(item.custom_link, item.whatsapp_no);
    const location = item.primary_details?.Place || item.job_location_slug || 'N/A';
    let salary = 'N/A';
    if (item.salary_min && item.salary_max) {
      salary = `₹${item.salary_min} - ₹${item.salary_max}`;
    } else if (item.primary_details?.Salary && item.primary_details.Salary !== '-') {
      salary = item.primary_details.Salary;
    }

    const imageUrl = item.creatives?.[0]?.thumb_url || item.creatives?.[0]?.file || null;

    return (
      <TouchableOpacity onPress={() => handleJobPress(item)} style={styles.jobCardContainer}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.logo}
            resizeMode="contain" 
          />
        ) : (
          <View style={[styles.logo, styles.placeholderLogo]}>
             <Text style={styles.placeholderText}>Logo</Text>
          </View>
        )}

        <View style={styles.jobCardContent}>
          <Text style={styles.title} numberOfLines={2}>{item.title || 'No Title'}</Text>
          <Text style={styles.detailText}>Location: {location}</Text>
          <Text style={styles.detailText}>Salary: {salary}</Text>
          <Text style={styles.detailText}>Phone: {phoneNumber}</Text>
          <Text style={styles.companyText}>Company: {item.company_name || 'N/A'}</Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title={isBookmarked ? "Saved" : "Save"}
            onPress={(e) => {
                 e.stopPropagation(); 
                 toggleBookmark(item);
            }}
            color={isBookmarked ? "#888" : "#007AFF"}
          />
        </View>
      </TouchableOpacity> 
    );
  });

   const renderFooter = () => {
      if (!isLoadingMore) return null;
      return <ActivityIndicator style={{ marginVertical: 20 }} size="small" color="#0000ff" />;
    };

    const handleLoadMore = () => {
      if (!isLoading && !isLoadingMore && hasMoreJobs) {
        fetchJobs(page + 1);
      }
    };

    const handleRefresh = () => {
      console.log("Refreshing jobs list...");
      setHasMoreJobs(true);
      fetchJobs(1, true);
    };

   if (isLoading && page === 1 && !isLoadingMore) {
      return <ActivityIndicator size="large" style={styles.centered} color="#0000ff" />;
    }
    if (error && jobs.length === 0) {
      return (
        <SafeAreaView style={styles.centered}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <Button title="Retry" onPress={handleRefresh} color="#007AFF" />
        </SafeAreaView>
      );
    }
    if (!isLoading && jobs.length === 0) {
      return (
        <SafeAreaView style={styles.centered}>
          <Text style={styles.emptyText}>No jobs found matching your criteria.</Text>
          <Button title="Refresh" onPress={handleRefresh} color="#007AFF" />
        </SafeAreaView>
      );
    }

   return (
      <SafeAreaView style={styles.screen}>
         {error && jobs.length > 0 && (
             <View style={styles.errorBanner}>
                 <Text style={styles.errorBannerText}>Could not load more jobs: {error}</Text>
             </View>
         )}
        <FlatList
          data={jobs}
          renderItem={({ item }) => <JobItem item={item} />}
          keyExtractor={(item) => item.id.toString()}
          style={styles.list}
          contentContainerStyle={styles.listContentContainer}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          refreshing={isLoading}
          onRefresh={handleRefresh}
        />
      </SafeAreaView>
    );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f0f0f0' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f0f0f0' },
  list: { flex: 1 },
  listContentContainer: { paddingBottom: 20, paddingTop: 8 },
  jobCardContainer: {
    marginVertical: 6,
    marginHorizontal: 12,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 10, 
    paddingVertical: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  logo: { 
    width: 60, 
    height: 60, 
    borderRadius: 8, 
    marginRight: 12, 
    backgroundColor: '#eee', 
  },
  placeholderLogo: { 
     justifyContent: 'center',
     alignItems: 'center',
     backgroundColor: '#e0e0e0', 
  },
   placeholderText: {
      fontSize: 10,
      color: '#888',
   },
  jobCardContent: { 
    flex: 1, 
    justifyContent: 'center', 
  },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 4, color: '#333' }, 
  detailText: { fontSize: 13, color: '#555', marginBottom: 2, lineHeight: 17 }, 
  companyText: { fontSize: 12, color: '#777', marginTop: 3 }, 
  buttonContainer: {
    marginLeft: 10, 
  },
  errorText: { fontSize: 16, color: '#D32F2F', textAlign: 'center', marginBottom: 15 },
  errorBanner: { padding: 10, backgroundColor: '#FFCDD2', alignItems: 'center' },
  errorBannerText: { color: '#D32F2F', fontSize: 14 },
  emptyText: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 15 },
});

export default JobsScreen;