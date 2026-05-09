import face_recognition
import numpy as np
import base64
import cv2
from typing import List, Optional, Tuple

class FaceService:
    @staticmethod
    def get_face_encoding(image_base64: str) -> Optional[List[float]]:
        """
        Convert base64 image to face encoding (128D vector)
        """
        try:
            # Decode base64 image
            encoded_data = image_base64.split(',')[1] if ',' in image_base64 else image_base64
            nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if img is None:
                return None
            
            # Convert BGR (OpenCV) to RGB (face_recognition)
            rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            
            # Find face locations and encodings
            face_locations = face_recognition.face_locations(rgb_img)
            if not face_locations:
                return None
                
            # Get the first face encoding
            encodings = face_recognition.face_encodings(rgb_img, face_locations)
            if not encodings:
                return None
                
            return encodings[0].tolist()
        except Exception as e:
            print(f"Error in get_face_encoding: {e}")
            return None

    @staticmethod
    def verify_face(known_encoding: List[float], face_to_verify_base64: str, tolerance: float = 0.6) -> Tuple[bool, float]:
        """
        Compare a known face encoding with a new image
        """
        try:
            new_encoding = FaceService.get_face_encoding(face_to_verify_base64)
            if new_encoding is None:
                return False, 1.0
            
            # Compare faces
            matches = face_recognition.compare_faces([np.array(known_encoding)], np.array(new_encoding), tolerance=tolerance)
            face_distances = face_recognition.face_distance([np.array(known_encoding)], np.array(new_encoding))
            
            return matches[0], float(face_distances[0])
        except Exception as e:
            print(f"Error in verify_face: {e}")
            return False, 1.0

face_service = FaceService()
