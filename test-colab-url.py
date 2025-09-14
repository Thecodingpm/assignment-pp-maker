#!/usr/bin/env python3
"""
Test script to find the correct Google Colab API URL
"""
import requests
import json

# Test different possible URLs
test_urls = [
    "https://zo610bsfc-496ff2e9c6d22116-0-colab.googleusercontent.com/generate-logo",
    "https://zo610bsfc-496ff2e9c6d22116-0-colab.googleusercontent.com:8080/generate-logo",
    "https://zo610bsfc-496ff2e9c6d22116-0-colab.googleusercontent.com:5000/generate-logo",
    "https://zo610bsfc-496ff2e9c6d22116-0-colab.googleusercontent.com:3000/generate-logo",
]

print("🔍 Testing Google Colab URLs...")
print("=" * 50)

for i, url in enumerate(test_urls, 1):
    print(f"\n{i}. Testing: {url}")
    try:
        response = requests.post(
            url,
            json={"prompt": "test logo"},
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        print(f"   Status: {response.status_code}")
        print(f"   Content-Type: {response.headers.get('content-type', 'Unknown')}")
        
        if response.status_code == 200:
            print("   ✅ SUCCESS! This URL works!")
            try:
                data = response.json()
                print(f"   Response: {json.dumps(data, indent=2)[:200]}...")
            except:
                print(f"   Response: {response.text[:200]}...")
        else:
            print(f"   ❌ Failed: {response.text[:100]}...")
            
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Error: {str(e)[:100]}...")

print("\n" + "=" * 50)
print("🎯 If none work, we need to get the correct URL from your Colab!")
