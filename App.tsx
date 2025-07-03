// import React from 'react';
// import { SafeAreaView } from 'react-native';
// import HomeScreen from './screens/HomeScreen';

// const App = () => {
//   return (
//     <SafeAreaView>
//       <HomeScreen />
//     </SafeAreaView>
//   );
// };

// export default App;
import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, PermissionsAndroid, Platform } from 'react-native';
import { RNCamera } from 'react-native-camera';
import Tflite from 'react-native-tflite';

const tflite = new Tflite();

export default function App() {
  const [detections, setDetections] = useState([]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
    }

    tflite.loadModel({
      model: 'detect.tflite',
      labels: 'labelmap.txt',
      numThreads: 1,
    }, (err, res) => {
      if (err) console.log('Error loading model:', err);
      else console.log('Model loaded:', res);
    });
  }, []);

  const handlePictureTaken = ({ uri }) => {
    tflite.detectObjectOnImage({
      path: uri,
      model: 'SSDMobileNet',
      imageMean: 127.5,
      imageStd: 127.5,
      threshold: 0.4,
      numResultsPerClass: 1,
    }, (err, res) => {
      if (err) console.error(err);
      else setDetections(res);
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <RNCamera
        style={{ flex: 1 }}
        captureAudio={false}
        onPictureTaken={handlePictureTaken}
        type={RNCamera.Constants.Type.back}
      />
      {detections.map((det, i) => (
        <Text key={i} style={styles.label}>
          {`${det.detectedClass} (${(det.confidenceInClass * 100).toFixed(2)}%)`}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#0008',
    color: '#fff',
    padding: 4,
    margin: 2,
    borderRadius: 4,
  },
});
