// Test script for Enhanced Logo Pipeline
// Run with: node test-enhanced-pipeline.js

const testEnhancedPipeline = async () => {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🧪 Testing Enhanced Logo Pipeline...\n');
  
  // Test 1: Health Check
  console.log('1️⃣ Testing Health Check...');
  try {
    const healthResponse = await fetch(`${baseUrl}/api/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health Check:', healthData);
  } catch (error) {
    console.log('❌ Health Check Failed:', error.message);
  }
  
  // Test 2: Single Enhanced Logo
  console.log('\n2️⃣ Testing Single Enhanced Logo...');
  try {
    const logoResponse = await fetch(`${baseUrl}/api/generate-logo-enhanced`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'modern tech startup logo',
        options: {
          style: 'professional',
          color: 'modern',
          industry: 'tech',
          shape: 'circle',
          upscale: true,
          convert_to_svg: false
        }
      })
    });
    
    const logoData = await logoResponse.json();
    console.log('✅ Single Logo Generated:', {
      success: logoData.success,
      shape: logoData.shape,
      dimensions: logoData.dimensions,
      upscaled: logoData.upscaled,
      enhanced: logoData.enhanced
    });
  } catch (error) {
    console.log('❌ Single Logo Failed:', error.message);
  }
  
  // Test 3: Logo Variations
  console.log('\n3️⃣ Testing Logo Variations...');
  try {
    const variationsResponse = await fetch(`${baseUrl}/api/generate-logo-enhanced-variations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'creative design agency logo',
        options: {
          style: 'creative',
          color: 'vibrant',
          industry: 'marketing',
          upscale: true,
          convert_to_svg: false
        }
      })
    });
    
    const variationsData = await variationsResponse.json();
    console.log('✅ Variations Generated:', {
      success: variationsData.success,
      total: variationsData.total,
      enhanced: variationsData.enhanced,
      shapes: variationsData.variations?.map(v => v.shape)
    });
  } catch (error) {
    console.log('❌ Variations Failed:', error.message);
  }
  
  // Test 4: Different Shapes
  console.log('\n4️⃣ Testing Different Shapes...');
  const shapes = ['circle', 'square', 'hexagon', 'triangle'];
  
  for (const shape of shapes) {
    try {
      const shapeResponse = await fetch(`${baseUrl}/api/generate-logo-enhanced`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `minimalist ${shape} logo`,
          options: {
            style: 'minimalist',
            color: 'monochrome',
            industry: 'general',
            shape: shape,
            upscale: false,
            convert_to_svg: false
          }
        })
      });
      
      const shapeData = await shapeResponse.json();
      console.log(`✅ ${shape} shape:`, {
        success: shapeData.success,
        dimensions: shapeData.dimensions
      });
    } catch (error) {
      console.log(`❌ ${shape} shape failed:`, error.message);
    }
  }
  
  console.log('\n🎉 Enhanced Pipeline Testing Complete!');
};

// Run the tests
testEnhancedPipeline().catch(console.error);

