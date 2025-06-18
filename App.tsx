import React, { useEffect, useState } from 'react';
import {
  View,
  Button,
  Image,
  Text,
  Platform,
  PermissionsAndroid,
  ScrollView,
  StyleSheet,
} from 'react-native';
import Tflite from 'react-native-tflite';
import { launchImageLibrary, Asset } from 'react-native-image-picker';

const tflite = new Tflite();

type ResultType = {
  confidence: number;
  label: string;
};

const App = () => {
  const [imageUri, setImageUri] = useState<string | undefined>();
  const [results, setResults] = useState<ResultType[]>([]);

  useEffect(() => {
    tflite.loadModel(
      {
        model: 'model.tflite',
        labels: 'labels.txt',
        numThreads: 1,
      },
      (err: any) => {
        if (err) {
          console.error('Failed to load model', err);
        } else {
          console.log('Model loaded successfully');
        }
      }
    );
  }, []);

  const requestPermission = async () => {
    if (Platform.OS === 'android') {
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
      );
    }
  };

  const pickImage = async () => {
    await requestPermission();

    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      const asset: Asset | undefined = response?.assets?.[0];
      if (asset?.uri) {
        setImageUri(asset.uri);
        runModel(asset.uri);
      }
    });
  };

  const runModel = (imagePath: string) => {
    tflite.runModelOnImage(
      {
        path: imagePath,
        imageMean: 127.5,
        imageStd: 127.5,
        numResults: 3,
        threshold: 0.1,
      },
      (err: any, res: ResultType[]) => {
        if (err) {
          console.error('TFLite Error:', err);
        } else {
          setResults(res);
        }
      }
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Button title="Pick an Image" onPress={pickImage} />
      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
      )}
      {results.map((item, index) => (
        <Text key={index} style={styles.resultText}>
          {item.label} - {(item.confidence * 100).toFixed(2)}%
        </Text>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  image: {
    width: 250,
    height: 250,
    marginVertical: 20,
  },
  resultText: {
    fontSize: 16,
    marginVertical: 4,
  },
});

export default App;
