import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile,
  sendPasswordResetEmail,
  User as FirebaseUser 
} from 'firebase/auth';
import { auth } from './config';
import { UserRole } from '../types/document';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export const registerUser = async (email: string, password: string, name: string): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update profile with display name
    await updateProfile(user, { displayName: name });
    
    // Determine role based on email (admin email check)
    const isAdmin = email === 'ahmadmuaaz292@gmail.com';
    
    return {
      id: user.uid,
      email: user.email || '',
      name: name,
      role: isAdmin ? 'admin' : 'user'
    };
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const loginUser = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Determine role based on email (admin email check)
    const isAdmin = email === 'ahmadmuaaz292@gmail.com';
    
    return {
      id: user.uid,
      email: user.email || '',
      name: user.displayName || 'User',
      role: isAdmin ? 'admin' : 'user'
    };
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getCurrentUser = (): User | null => {
  const user = auth.currentUser;
  if (!user) return null;
  
  // Determine role based on email (admin email check)
  const isAdmin = user.email === 'ahmadmuaaz292@gmail.com';
  
  return {
    id: user.uid,
    email: user.email || '',
    name: user.displayName || 'User',
    role: isAdmin ? 'admin' : 'user'
  };
};

export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    throw new Error(error.message);
  }
}; 