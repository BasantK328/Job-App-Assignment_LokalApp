import React from 'react';
import { TouchableOpacity, Alert, StyleSheet } from 'react-native'; 
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons'; 

import JobsScreen from './screens/JobsScreen';
import BookmarksScreen from './screens/BookmarksScreen';
import JobDetailsScreen from './screens/JobDetailsScreen';

const Tab = createBottomTabNavigator();
const JobsStack = createStackNavigator();

const NotificationButton = ({ tintColor }) => {
  const handleNotificationPress = () => {
    Alert.alert('Notifications');
  };

  return (
    <TouchableOpacity onPress={handleNotificationPress} style={styles.headerButton}>
      <Ionicons name="notifications-outline" size={25} color={tintColor} />
    </TouchableOpacity>
  );
};

function JobsStackNavigator() {
  return (
    <JobsStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#007AFF' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        headerRight: ({ tintColor }) => <NotificationButton tintColor={tintColor} />,
      }}
    >
      <JobsStack.Screen
        name="JobList"
        component={JobsScreen}
        options={{ title: 'Available Jobs' }}
      />
      <JobsStack.Screen
        name="JobDetails"
        component={JobDetailsScreen}
        options={{ title: 'Job Details' }}
      />
    </JobsStack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'JobsTab') {
              iconName = focused ? 'briefcase' : 'briefcase-outline';
            } else if (route.name === 'Bookmarks') {
              iconName = focused ? 'bookmark' : 'bookmark-outline';
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: 'gray',
          headerShown: false, 
        })}
      >
        <Tab.Screen
          name="JobsTab"
          component={JobsStackNavigator} 
          options={{
            title: 'Jobs',
          }}
        />
        
        <Tab.Screen
          name="Bookmarks"
          component={BookmarksScreen}
          options={{
            title: 'Saved Jobs',
            headerShown: true, 
            headerStyle: { backgroundColor: '#007AFF' },
            headerTintColor: '#fff', 
            headerTitleStyle: { fontWeight: 'bold' },
            headerRight: ({ tintColor }) => <NotificationButton tintColor={tintColor} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
    headerButton: {
        marginRight: 15, 
    }
});