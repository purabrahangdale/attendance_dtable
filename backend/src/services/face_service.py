import numpy as np
import base64
import cv2
import os
from typing import List, Optional, Tuple

# Try to import face_recognition, but handle failure gracefully
try:
    import face_recognition
    FACE_RECOGNITION_AVAILABLE = True
    print("Face recognition engine (dlib) loaded successfully.")
except Exception as e:
    face_recognition = None
    FACE_RECOGNITION_AVAILABLE = False
    print(f"WARNING: Face recognition engine (dlib) failed to load. Error: {e}")
    print("Face recognition features will be disabled. Only detection (OpenCV) will work.")

class FaceService:
    def __init__(self):
        # Load OpenCV face detector as a fallback
        cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        self.face_cascade = cv2.CascadeClassifier(cascade_path)

    def get_face_encoding(self, image_base64: str) -> Optional[List[float]]:
        """
        Convert base64 image to face encoding (128D vector)
        """
        try:
            # Decode base64 image
            encoded_data = image_base64.split(',')[1] if ',' in image_base64 else image_base64
            nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if img is None:
                print("Failed to decode image.")
                return None
            
            # Convert BGR (OpenCV) to RGB
            rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            gray_img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            
            # 1. Try OpenCV detection first to confirm if ANY face exists
            opencv_faces = self.face_cascade.detectMultiScale(gray_img, 1.1, 4)
            if len(opencv_faces) == 0:
                print("OpenCV: No face detected in the image.")
                return None
            
            print(f"OpenCV: Detected {len(opencv_faces)} potential face(s).")
            
            # 2. Try face_recognition if available
            if not FACE_RECOGNITION_AVAILABLE:
                print("CRITICAL: Face recognition engine is not available. Cannot extract encoding.")
                # We return None but the logs will show why
                return None
                
            face_locations = face_recognition.face_locations(rgb_img)
            if not face_locations:
                print("face_recognition: No faces found (OpenCV might have had a false positive or image quality is low).")
                return None
                
            encodings = face_recognition.face_encodings(rgb_img, face_locations)
            if not encodings:
                print("face_recognition: Found face location but failed to extract encoding.")
                return None
                
            print("Successfully extracted face encoding.")
            return encodings[0].tolist()
        except Exception as e:
            print(f"Error in get_face_encoding: {e}")
            return None

    def verify_face(self, known_encoding: List[float], face_to_verify_base64: str, tolerance: float = 0.6) -> Tuple[bool, float]:
        """
        Compare a known face encoding with a new image
        """
        if not FACE_RECOGNITION_AVAILABLE:
            print("Verification failed: Face recognition engine not available.")
            return False, 1.0
            
        try:
            new_encoding = self.get_face_encoding(face_to_verify_base64)
            if new_encoding is None:
                return False, 1.0
            
            matches = face_recognition.compare_faces([np.array(known_encoding)], np.array(new_encoding), tolerance=tolerance)
            face_distances = face_recognition.face_distance([np.array(known_encoding)], np.array(new_encoding))
            
            return matches[0], float(face_distances[0])
        except Exception as e:
            print(f"Error in verify_face: {e}")
            return False, 1.0

face_service = FaceService()

