import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  Button,
  Alert,
} from 'react-native';
import { RNCamera } from 'react-native-camera';
import Tflite from 'react-native-tflite';

const tflite = new Tflite();

export default function App() {
  const [modelLoaded, setModelLoaded] = useState(false);
  const [detections, setDetections] = useState([]);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Camera permission denied');
          return;
        }
      }

      tflite.loadModel(
        {
          model: 'detect.tflite', // Make sure this path is correct in `assets`
          labels: 'labelmap.txt',
          numThreads: 1,
        },
        (err, res) => {
          if (err) {
            console.log('Model loading error:', err);
            Alert.alert('Error loading model');
          } else {
            console.log('Model loaded successfully');
            setModelLoaded(true);
          }
        }
      );
    })();
  }, []);

  const takePicture = async () => {
    if (!modelLoaded) {
      Alert.alert('Model not loaded yet');
      return;
    }

    if (cameraRef.current) {
      try {
        const options = { quality: 0.5, base64: true };
        const data = await cameraRef.current.takePictureAsync(options);
        handlePictureTaken(data.uri);
      } catch (error) {
        console.log('Camera error:', error);
      }
    }
  };

  const handlePictureTaken = (uri) => {
    tflite.detectObjectOnImage(
      {
        path: uri,
        model: 'SSDMobileNet',
        imageMean: 127.5,
        imageStd: 127.5,
        threshold: 0.4,
        numResultsPerClass: 5,
      },
      (err, res) => {
        if (err) {
          console.error('Detection error:', err);
          Alert.alert('Detection failed');
        } else {
          setDetections(res);
          console.log('Detections:', res);
        }
      }
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <RNCamera
        ref={cameraRef}
        style={{ flex: 1 }}
        captureAudio={false}
        type={RNCamera.Constants.Type.back}
      />
      <View style={styles.detections}>
        {detections.map((det, i) => (
          <Text key={i} style={styles.label}>
            {`${det.detectedClass} (${(det.confidenceInClass * 100).toFixed(1)}%)`}
          </Text>
        ))}
      </View>
      <Button title="Capture" onPress={takePicture} />
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    backgroundColor: '#0008',
    color: '#fff',
    padding: 6,
    marginVertical: 2,
    borderRadius: 4,
    fontSize: 14,
  },
  detections: {
    position: 'absolute',
    top: 20,
    left: 10,
    right: 10,
    zIndex: 1,
  },
});
