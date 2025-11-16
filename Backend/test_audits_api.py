import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:5000"

def test_health():
    """Test health endpoint"""
    print("1. Testing health endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/api/health", timeout=5)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            print(f"   Response: {response.json()}\n")
            return True
        else:
            print(f"   Error: {response.text}\n")
            return False
    except requests.exceptions.ConnectionError:
        print("   ERROR: Cannot connect to backend. Is it running?\n")
        return False
    except Exception as e:
        print(f"   ERROR: {str(e)}\n")
        return False

def test_login():
    """Test login to get token"""
    print("2. Testing login...")
    try:
        login_data = {
            "email": "admin@5s.com",
            "password": "Admin123!"
        }
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json=login_data,
            timeout=5
        )
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            token = result.get("token")
            if token:
                print(f"   Token received: {token[:50]}...\n")
                return token
            else:
                print(f"   Response: {result}\n")
                return None
        else:
            print(f"   Error: {response.text}\n")
            return None
    except Exception as e:
        print(f"   ERROR: {str(e)}\n")
        return None

def test_get_audits(token):
    """Test GET /api/audits"""
    print("3. Testing GET /api/audits...")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(
            f"{BASE_URL}/api/audits",
            headers=headers,
            timeout=5
        )
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            audits = response.json()
            print(f"   Found {len(audits)} audits")
            if audits:
                print(f"   First audit: {json.dumps(audits[0], indent=2, default=str)[:300]}...\n")
            else:
                print("   No audits found\n")
            return True
        else:
            print(f"   Error: {response.text}\n")
            return False
    except Exception as e:
        print(f"   ERROR: {str(e)}\n")
        return False

def test_create_audit_plan(token):
    """Test POST /api/audits/plan"""
    print("4. Testing POST /api/audits/plan...")
    try:
        plan_data = {
            "departmentId": 1,
            "auditorId": 1,
            "area": "Test Alanı",
            "areaSupervisor": "Test Sorumlu",
            "auditDate": datetime.now().isoformat(),
            "notes": "Test denetim planı"
        }
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        response = requests.post(
            f"{BASE_URL}/api/audits/plan",
            json=plan_data,
            headers=headers,
            timeout=5
        )
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"   Created audit: {json.dumps(result, indent=2, default=str)[:300]}...\n")
            return True
        else:
            print(f"   Error: {response.text}\n")
            return False
    except Exception as e:
        print(f"   ERROR: {str(e)}\n")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("Testing Audits API")
    print("=" * 60)
    print()
    
    # Test 1: Health check
    if not test_health():
        print("Backend is not running. Please start it first.")
        exit(1)
    
    # Test 2: Login
    token = test_login()
    if not token:
        print("Cannot proceed without authentication token.")
        exit(1)
    
    # Test 3: Get audits
    test_get_audits(token)
    
    # Test 4: Create audit plan
    test_create_audit_plan(token)
    
    print("=" * 60)
    print("Tests completed!")
    print("=" * 60)

