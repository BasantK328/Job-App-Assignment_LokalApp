import React, { useCallback } from 'react'; 
import {
    View, Text, StyleSheet, ScrollView, Linking, Button,
    SafeAreaView, Alert, Share 
} from 'react-native';

const JobDetailsScreen = ({ route }) => {
    if (!route?.params?.job || typeof route.params.job !== 'object') {
        console.error("JobDetailsScreen: Invalid/missing route.params.job");
        return <SafeAreaView style={styles.centered}><Text style={styles.errorText}>Error: Could not load job details.</Text></SafeAreaView>;
    }
    const { job } = route.params;

    const getDetailString = (value, prefix = '', fallback = 'N/A') => {
        if (value == null) return fallback;
        try { return prefix + String(value); }
        catch (e) { console.error("String conversion error", e, value); return fallback; }
    };
    const extractPhoneNumber = (link) => (link && typeof link === 'string' && link.startsWith('tel:')) ? link.substring(4) : null;

    const extractedPhone = extractPhoneNumber(job.custom_link);
    const phoneNumberForCall = extractedPhone || job.whatsapp_no; 
    const displayPhoneNumber = getDetailString(phoneNumberForCall, '', 'N/A'); 
    const locationString = getDetailString(job.primary_details?.Place || job.job_location_slug);
    let salaryString = 'N/A';
    if (job.salary_min != null && job.salary_max != null) salaryString = `₹${job.salary_min}-${job.salary_max}`;
    else if (job.primary_details?.Salary && job.primary_details.Salary !== '-') salaryString = getDetailString(job.primary_details.Salary);
    const titleString = getDetailString(job.title, '', 'Job Title Not Available');
    const companyString = getDetailString(job.company_name, 'Company: ');
    const jobRoleString = getDetailString(job.job_role);
    const experienceString = getDetailString(job.primary_details?.Experience);
    const qualificationString = getDetailString(job.primary_details?.Qualification);
    const descriptionString = getDetailString(job.other_details);
    const whatsAppLink = job.contact_preference?.whatsapp_link; 

    const onShare = useCallback(async () => {
        try {
            const messageToShare = `Check out this job opportunity:\n\n*${titleString}* at ${getDetailString(job.company_name)}\nLocation: ${locationString}\nSalary: ${salaryString}\n\nContact: ${displayPhoneNumber !== 'N/A' ? displayPhoneNumber : 'See app for details'}`;

            const result = await Share.share({
                message: messageToShare,
                title: `Job Opportunity: ${titleString}` 
            });

            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    console.log(`Shared via ${result.activityType}`);
                } else {
                    console.log('Shared successfully');
                }
            } else if (result.action === Share.dismissedAction) {
                console.log('Share dismissed');
            }
        } catch (error) {
            Alert.alert("Error", "Could not share job details.");
            console.error('Share error:', error.message);
        }
    }, [job, titleString, locationString, salaryString, displayPhoneNumber]); 

    const onWhatsAppPress = useCallback(async () => {
        if (!whatsAppLink) {
            Alert.alert("Not Available", "WhatsApp contact link is not provided for this job.");
            return;
        }
        try {
            const supported = await Linking.canOpenURL(whatsAppLink);
            if (supported) {
                await Linking.openURL(whatsAppLink);
            } else {
                Alert.alert("Error", "Cannot open WhatsApp. Make sure it's installed.");
            }
        } catch (error) {
            Alert.alert("Error", "An error occurred while trying to open WhatsApp.");
            console.error('WhatsApp link error:', error);
        }
    }, [whatsAppLink]); 

    const handleCallPress = useCallback(async () => {
        let numberToCall = phoneNumberForCall; 
        if (numberToCall && numberToCall !== 'N/A') {
            let callUrl = `tel:${numberToCall}`;
            try {
                const supported = await Linking.canOpenURL(callUrl);
                if (supported) {
                    await Linking.openURL(callUrl);
                } else {
                    Alert.alert("Error", `Cannot initiate call to ${numberToCall}.`);
                }
            } catch (error) {
                Alert.alert("Error", "Could not initiate call.");
                console.error('Call error:', error);
            }
        } else {
            Alert.alert("No Phone Number", "No contact number available for calling.");
        }
    }, [phoneNumberForCall]); 

    return (
        <SafeAreaView style={styles.screen}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>{titleString}</Text>
                <Text style={styles.company}>{companyString}</Text>
                <View style={styles.detailRow}><Text style={styles.label}>Location:</Text><Text style={styles.value}>{locationString}</Text></View>
                <View style={styles.detailRow}><Text style={styles.label}>Salary:</Text><Text style={styles.value}>{salaryString}</Text></View>
                <View style={styles.detailRow}><Text style={styles.label}>Job Role:</Text><Text style={styles.value}>{jobRoleString}</Text></View>
                <View style={styles.detailRow}><Text style={styles.label}>Experience:</Text><Text style={styles.value}>{experienceString}</Text></View>
                <View style={styles.detailRow}><Text style={styles.label}>Qualification:</Text><Text style={styles.value}>{qualificationString}</Text></View>

                {job.other_details ? (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.description}>{descriptionString}</Text>
                    </View>
                ) : null}

                <View style={styles.actionsContainer}>
                    <Text style={styles.actionsTitle}>Actions</Text>

                    {whatsAppLink ? (
                        <View style={styles.actionButtonWrapper}>
                            <Button title="Apply via WhatsApp" onPress={onWhatsAppPress} color="#25D366"/>
                        </View>
                    ) : null}

                    {phoneNumberForCall && phoneNumberForCall !== 'N/A' ? (
                         <View style={styles.actionButtonWrapper}>
                             <Button title={job.button_text?.includes('Call') ? job.button_text : `Call (${displayPhoneNumber})`} onPress={handleCallPress} color="#007AFF"/>
                         </View>
                     ) : null}

                     <View style={styles.actionButtonWrapper}>
                         <Button title="Share Job" onPress={onShare} color="#555555"/>
                     </View>
                 </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { fontSize: 16, color: '#D32F2F', textAlign: 'center'},
  container: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8, color: '#333' },
  company: { fontSize: 18, color: '#555', marginBottom: 16 },
  detailRow: { flexDirection: 'row', marginBottom: 10, alignItems: 'flex-start' },
  label: { fontSize: 16, fontWeight: '600', color: '#444', marginRight: 8, width: 110 },
  value: { fontSize: 16, color: '#666', flex: 1 },
  section: { marginTop: 20, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 15, marginBottom: 10 }, 
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  description: { fontSize: 15, lineHeight: 22, color: '#555' },
  
  actionsContainer: {
      marginTop: 25,
      borderTopWidth: 1,
      borderTopColor: '#eee',
      paddingTop: 20,
  },
  actionsTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 15,
      color: '#333',
      textAlign: 'center' 
  },
  actionButtonWrapper: {
      marginVertical: 8, 
  },
});
export default JobDetailsScreen;