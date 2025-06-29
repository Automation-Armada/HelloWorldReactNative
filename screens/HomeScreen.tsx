// screens/HomeScreen.tsx
import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import axios from 'axios';

const HomeScreen = () => {
  const [data, setData] = useState<string>('');        // Response data
  const [status, setStatus] = useState<number | null>(null); // HTTP status
  const [timestamp, setTimestamp] = useState<string>('');    // Response timestamp
  const [duration, setDuration] = useState<number | null>(null); // Response time in ms
  const [loading, setLoading] = useState(false);       // Loading flag

  const fetchData = async () => {
    try {
      setLoading(true);

      const startTime = Date.now(); // Start timer
      const response = await axios.get('https://jsonplaceholder.typicode.com/posts/1');
      const endTime = Date.now();   // End timer

      setData(response.data.title);
      setStatus(response.status);
      setTimestamp(new Date().toLocaleString());
      setDuration(endTime - startTime); // in milliseconds
    } catch (error: any) {
      const endTime = Date.now();
      setData('Failed to load data');
      setStatus(error?.response?.status || 0);
      setTimestamp(new Date().toLocaleString());
      setDuration(endTime - error?.config?.metadata?.startTime || 0);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Info Request App</Text>

      <Button title="Get Info" onPress={fetchData} />

      {loading ? (
        <Text style={styles.loading}>Loading...</Text>
      ) : (
        data !== '' && (
          <View style={styles.resultBox}>
            <Text style={styles.response}>📦 Response: {data}</Text>
            <Text>Status: {status}</Text>
            <Text>Time: {timestamp}</Text>
            <Text>⏱️ Duration: {duration} ms</Text>
          </View>
        )
      )}
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 40,
  },
  heading: {
    fontSize: 24,
    marginBottom: 20,
  },
  loading: {
    marginTop: 20,
    color: 'gray',
  },
  resultBox: {
    marginTop: 20,
    backgroundColor: '#eef',
    padding: 15,
    borderRadius: 8,
  },
  response: {
    fontSize: 18,
    color: 'blue',
    marginBottom: 4,
  },
});
