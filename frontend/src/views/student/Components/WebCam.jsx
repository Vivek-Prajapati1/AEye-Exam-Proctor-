// import React, { useRef, useState, useEffect } from 'react';
// import Webcam from 'react-webcam';
// import { Box, Card, Typography } from '@mui/material';
// import swal from 'sweetalert';
// import { UploadClient } from '@uploadcare/upload-client';

// const client = new UploadClient({ publicKey: 'f9a34ac46371722e845b' });

// export default function Home({ cheatingLog, updateCheatingLog }) {
//   const webcamRef = useRef(null);
//   const [screenshots, setScreenshots] = useState([]);
//   const [isModelLoading, setIsModelLoading] = useState(true);
//   const [modelError, setModelError] = useState(null);

//   // Initialize screenshots array when component mounts
//   useEffect(() => {
//     if (cheatingLog && cheatingLog.screenshots) {
//       setScreenshots(cheatingLog.screenshots);
//     }
//   }, [cheatingLog]);

//   const captureScreenshotAndUpload = async (type) => {
//     const video = webcamRef.current?.video;

//     if (
//       !video ||
//       video.readyState !== 4 || // ensure video is ready
//       video.videoWidth === 0 ||
//       video.videoHeight === 0
//     ) {
//       console.warn('Video not ready for screenshot');
//       return null;
//     }

//     const canvas = document.createElement('canvas');
//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;

//     const context = canvas.getContext('2d');
//     context.drawImage(video, 0, 0, canvas.width, canvas.height);

//     const dataUrl = canvas.toDataURL('image/jpeg');
//     const file = dataURLtoFile(dataUrl, `cheating_${Date.now()}.jpg`);

//     try {
//       const result = await client.uploadFile(file);
//       console.log('✅ Uploaded to Uploadcare:', result.cdnUrl);
      
//       const screenshot = {
//         url: result.cdnUrl,
//         type: type,
//         detectedAt: new Date()
//       };

//       // Update local screenshots state
//       setScreenshots(prev => [...prev, screenshot]);
      
//       return screenshot;
//     } catch (error) {
//       console.error('❌ Upload failed:', error);
//       return null;
//     }
//   };

//   const handleDetection = async (type) => {
//     // Capture and upload screenshot
//     const screenshot = await captureScreenshotAndUpload(type);
    
//     if (screenshot) {
//       // Update cheating log with new count and screenshot
//       const updatedLog = {
//         ...cheatingLog,
//         [`${type}Count`]: (cheatingLog[`${type}Count`] || 0) + 1,
//         screenshots: [...(cheatingLog.screenshots || []), screenshot]
//       };

//       console.log('Updating cheating log with:', updatedLog);
//       updateCheatingLog(updatedLog);
//     }

//     switch (type) {
//       case 'noFace':
//         swal('Face Not Visible', 'Warning Recorded', 'warning');
//         break;
//       case 'multipleFace':
//         swal('Multiple Faces Detected', 'Warning Recorded', 'warning');
//         break;
//       case 'cellPhone':
//         swal('Cell Phone Detected', 'Warning Recorded', 'warning');
//         break;
//       case 'prohibitedObject':
//         swal('Prohibited Object Detected', 'Warning Recorded', 'warning');
//         break;
//       default:
//         break;
//     }
//   };

//   useEffect(() => {
//     const loadModel = async () => {
//       try {
//         // Dynamically import TensorFlow.js and COCO-SSD
//         const tf = await import('@tensorflow/tfjs');
//         const cocossd = await import('@tensorflow-models/coco-ssd');
        
//         const net = await cocossd.load();
//         console.log('AI model loaded.');
//         setIsModelLoading(false);
        
//         // Start detection loop
//         setInterval(() => {
//           if (webcamRef.current && webcamRef.current.video && webcamRef.current.video.readyState === 4) {
//             detect(net);
//           }
//         }, 1000);
//       } catch (error) {
//         console.error('Error loading model:', error);
//         setModelError('Failed to load AI model. Please refresh the page.');
//         setIsModelLoading(false);
//         swal('Error', 'Failed to load AI model. Please refresh the page.', 'error');
//       }
//     };

//     loadModel();
//   }, []);

//   const detect = async (net) => {
//     if (!webcamRef.current || !webcamRef.current.video || webcamRef.current.video.readyState !== 4) {
//       return;
//     }

//     try {
//       const video = webcamRef.current.video;
//       const obj = await net.detect(video);

//       let person_count = 0;
//       let faceDetected = false;

//       obj.forEach((element) => {
//         const detectedClass = element.class;
//         console.log('Detected:', detectedClass);

//         if (detectedClass === 'cell phone') handleDetection('cellPhone');
//         if (detectedClass === 'book' || detectedClass === 'laptop')
//           handleDetection('prohibitedObject');
//         if (detectedClass === 'person') {
//           faceDetected = true;
//           person_count++;
//           if (person_count > 1) handleDetection('multipleFace');
//         }
//       });

//       if (!faceDetected) handleDetection('noFace');
//     } catch (error) {
//       console.error('Error during detection:', error);
//     }
//   };

//   return (
//     <Box>
//       <Card variant="outlined" sx={{ position: 'relative', width: '100%', height: '100%' }}>
//         {modelError ? (
//           <Box sx={{ p: 2, textAlign: 'center' }}>
//             <Typography color="error">{modelError}</Typography>
//           </Box>
//         ) : (
//           <>
//             <Webcam
//               ref={webcamRef}
//               audio={false}
//               muted
//               screenshotFormat="image/jpeg"
//               videoConstraints={{
//                 width: 640,
//                 height: 480,
//                 facingMode: 'user',
//               }}
//               style={{
//                 width: '100%',
//                 height: '100%',
//                 objectFit: 'cover',
//               }}
//             />
//             {isModelLoading && (
//               <Box
//                 sx={{
//                   position: 'absolute',
//                   top: 0,
//                   left: 0,
//                   width: '100%',
//                   height: '100%',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   backgroundColor: 'rgba(0, 0, 0, 0.5)',
//                   color: 'white',
//                 }}
//               >
//                 <Typography>Loading AI model...</Typography>
//               </Box>
//             )}
//           </>
//         )}
//       </Card>
//     </Box>
//   );
// }

// // Helper to convert base64 to File
// function dataURLtoFile(dataurl, filename) {
//   const arr = dataurl.split(',');
//   const mime = arr[0].match(/:(.*?);/)[1];
//   const bstr = atob(arr[1]);
//   let n = bstr.length;
//   const u8arr = new Uint8Array(n);
//   while (n--) {
//     u8arr[n] = bstr.charCodeAt(n);
//   }
//   return new File([u8arr], filename, { type: mime });
// }












import React, { useRef, useState, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Box, Card, Typography } from '@mui/material';
import swal from 'sweetalert';
import { UploadClient } from '@uploadcare/upload-client';
import { useParams } from 'react-router-dom';

const client = new UploadClient({ publicKey: 'f9a34ac46371722e845b' });

export default function Home({ cheatingLog, updateCheatingLog }) {
  const { examId } = useParams();
  const webcamRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  const [screenshots, setScreenshots] = useState([]);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [modelError, setModelError] = useState(null);
  const [model, setModel] = useState(null);

  // Initialize screenshots array when component mounts
  useEffect(() => {
    if (cheatingLog && cheatingLog.screenshots) {
      setScreenshots(cheatingLog.screenshots);
    }
  }, [cheatingLog]);

  const captureScreenshotAndUpload = async (type) => {
    const video = webcamRef.current?.video;

    if (
      !video ||
      video.readyState !== 4 || // ensure video is ready
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {
      console.warn('Video not ready for screenshot');
      return null;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg');
    const file = dataURLtoFile(dataUrl, `cheating_${Date.now()}.jpg`);

    try {
      const result = await client.uploadFile(file);
      console.log('✅ Uploaded to Uploadcare:', result.cdnUrl);
      
      const screenshot = {
        url: result.cdnUrl,
        type: type,
        detectedAt: new Date()
      };

      // Update local screenshots state
      setScreenshots(prev => [...prev, screenshot]);
      
      return screenshot;
    } catch (error) {
      console.error('❌ Upload failed:', error);
      return null;
    }
  };

  const handleDetection = useCallback(async (type) => {
    // Capture and upload screenshot
    const screenshot = await captureScreenshotAndUpload(type);
    
    if (screenshot) {
      // Send only deltas to avoid double counting in context aggregator
      const deltaLog = {
        examId: examId,
        [`${type}Count`]: 1,
        screenshots: [screenshot]
      };

      console.log('Updating cheating log with (delta):', deltaLog);
      updateCheatingLog(deltaLog);
    }

    switch (type) {
      case 'noFace':
        swal('Face Not Visible', 'Warning Recorded', 'warning');
        break;
      case 'multipleFace':
        swal('Multiple Faces Detected', 'Warning Recorded', 'warning');
        break;
      case 'cellPhone':
        swal('Cell Phone Detected', 'Warning Recorded', 'warning');
        break;
      case 'prohibitedObject':
        swal('Prohibited Object Detected', 'Warning Recorded', 'warning');
        break;
      default:
        break;
    }
  }, [examId]); // Add examId dependency

  const detect = useCallback(async (net) => {
    if (!webcamRef.current || !webcamRef.current.video || webcamRef.current.video.readyState !== 4) {
      return;
    }

    try {
      const video = webcamRef.current.video;
      const obj = await net.detect(video);

      let person_count = 0;
      let faceDetected = false;

      obj.forEach((element) => {
        const detectedClass = element.class;
        console.log('Detected:', detectedClass);

        if (detectedClass === 'cell phone') handleDetection('cellPhone');
        if (detectedClass === 'book' || detectedClass === 'laptop')
          handleDetection('prohibitedObject');
        if (detectedClass === 'person') {
          faceDetected = true;
          person_count++;
          if (person_count > 1) handleDetection('multipleFace');
        }
      });

      if (!faceDetected) handleDetection('noFace');
    } catch (error) {
      console.error('Error during detection:', error);
    }
  }, [handleDetection]);

  useEffect(() => {
    let isMounted = true;
    let hasLoaded = false; // Prevent multiple loads
    
    const loadModel = async () => {
      if (hasLoaded) return; // Prevent multiple loads
      hasLoaded = true;
      
      try {
        console.log('Starting AI model loading...');
        setIsModelLoading(true);
        setModelError(null);
        
        // Preload TensorFlow.js in the background
        const tf = await import('@tensorflow/tfjs');
        await tf.ready(); // Ensure TensorFlow.js is fully ready
        
        // Load COCO-SSD model
        const cocossd = await import('@tensorflow-models/coco-ssd');
        const net = await cocossd.load();
        
        if (isMounted) {
          console.log('AI model loaded successfully.');
          setModel(net);
          setIsModelLoading(false);
          
          // Start detection loop with a reasonable interval
          detectionIntervalRef.current = setInterval(() => {
            if (webcamRef.current && webcamRef.current.video && webcamRef.current.video.readyState === 4) {
              detect(net);
            }
          }, 2000); // Reduced from 1000ms to 2000ms for better performance
        }
      } catch (error) {
        console.error('Error loading model:', error);
        if (isMounted) {
          setModelError('Failed to load AI model. Please refresh the page.');
          setIsModelLoading(false);
          swal('Error', 'Failed to load AI model. Please refresh the page.', 'error');
        }
      }
    };

    loadModel();

    // Cleanup function
    return () => {
      isMounted = false;
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, []); // Remove detect dependency to prevent infinite loops

  return (
    <Box>
      <Card variant="outlined" sx={{ position: 'relative', width: '100%', height: '100%' }}>
        {modelError ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography color="error">{modelError}</Typography>
          </Box>
        ) : (
          <>
            <Webcam
              ref={webcamRef}
              audio={false}
              muted
              screenshotFormat="image/jpeg"
              videoConstraints={{
                width: 640,
                height: 480,
                facingMode: 'user',
              }}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
              onUserMedia={() => console.log('Webcam ready')}
              onUserMediaError={(error) => {
                console.error('Webcam error:', error);
                setModelError('Failed to access webcam. Please check permissions.');
              }}
            />
            {isModelLoading && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  color: 'white',
                }}
              >
                <Typography>Loading AI model...</Typography>
              </Box>
            )}
          </>
        )}
      </Card>
    </Box>
  );
}

// Helper to convert base64 to File
function dataURLtoFile(dataurl, filename) {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}