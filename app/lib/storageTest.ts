// Test file to check storage configuration
import { getStorageInfo } from './unifiedStorage';

export function testStorageConfiguration() {
  const info = getStorageInfo();
  
  console.log('=== Storage Configuration Test ===');
  console.log('Provider:', info.provider);
  console.log('Configured:', info.configured);
  console.log('Config:', info.config);
  
  if (info.provider === 'firebase') {
    console.log('✅ Using Firebase Storage - Ready to use!');
    console.log('📁 Files will be stored in Firebase Storage');
    console.log('🔗 URLs will be saved in Firestore database');
  } else if (info.provider === 's3') {
    if (info.configured) {
      console.log('✅ Using AWS S3 - Ready to use!');
      console.log('📁 Files will be stored in S3 bucket:', info.config.bucket);
      console.log('🌍 Region:', info.config.region);
    } else {
      console.log('❌ S3 not properly configured');
      console.log('🔧 Please check your AWS credentials');
    }
  }
  
  return info;
}

// Run test on import
if (typeof window !== 'undefined') {
  testStorageConfiguration();
}
