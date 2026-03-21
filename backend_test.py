import requests
import sys
import json
from datetime import datetime
import uuid

class OutboxAPITester:
    def __init__(self, base_url="https://email-craft-pro.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.auth_token = None
        self.test_user_email = f"test_user_{uuid.uuid4().hex[:8]}@example.com"
        self.test_user_password = "TestPass123!"
        self.test_user_name = "Test User"

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
        
        result = {
            "test_name": name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅ PASSED" if success else "❌ FAILED"
        print(f"{status} - {name}")
        if details:
            print(f"   Details: {details}")

    def test_user_registration(self):
        """Test user registration"""
        try:
            user_data = {
                "email": self.test_user_email,
                "password": self.test_user_password,
                "name": self.test_user_name
            }
            
            response = requests.post(f"{self.api_url}/auth/register", json=user_data, timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                has_token = bool(data.get('access_token'))
                has_user = bool(data.get('user'))
                token_type = data.get('token_type') == 'bearer'
                
                if has_token and has_user and token_type:
                    self.auth_token = data['access_token']
                    details = f"Registration successful. User ID: {data['user'].get('id', 'N/A')}"
                    self.log_test("User registration", True, details)
                else:
                    missing = []
                    if not has_token: missing.append("access_token")
                    if not has_user: missing.append("user")
                    if not token_type: missing.append("correct token_type")
                    self.log_test("User registration", False, f"Missing: {', '.join(missing)}")
            else:
                error_msg = response.text[:200] if response.text else "No error message"
                self.log_test("User registration", False, f"Status: {response.status_code}, Error: {error_msg}")
                
        except Exception as e:
            self.log_test("User registration", False, f"Error: {str(e)}")

    def test_user_login(self):
        """Test user login with existing credentials"""
        try:
            login_data = {
                "email": self.test_user_email,
                "password": self.test_user_password
            }
            
            response = requests.post(f"{self.api_url}/auth/login", json=login_data, timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                has_token = bool(data.get('access_token'))
                has_user = bool(data.get('user'))
                
                if has_token and has_user:
                    # Update token for subsequent tests
                    self.auth_token = data['access_token']
                    details = f"Login successful. User: {data['user'].get('name', 'N/A')}"
                    self.log_test("User login", True, details)
                else:
                    self.log_test("User login", False, "Missing token or user data")
            else:
                error_msg = response.text[:200] if response.text else "No error message"
                self.log_test("User login", False, f"Status: {response.status_code}, Error: {error_msg}")
                
        except Exception as e:
            self.log_test("User login", False, f"Error: {str(e)}")

    def test_invalid_login(self):
        """Test login with invalid credentials"""
        try:
            login_data = {
                "email": "nonexistent@example.com",
                "password": "wrongpassword"
            }
            
            response = requests.post(f"{self.api_url}/auth/login", json=login_data, timeout=10)
            # Should return 401 for invalid credentials
            success = response.status_code == 401
            details = f"Status: {response.status_code} (expected 401 for invalid credentials)"
            self.log_test("Invalid login rejection", success, details)
                
        except Exception as e:
            self.log_test("Invalid login rejection", False, f"Error: {str(e)}")

    def test_get_current_user(self):
        """Test getting current user with valid token"""
        if not self.auth_token:
            self.log_test("Get current user", False, "No auth token available")
            return
            
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            response = requests.get(f"{self.api_url}/auth/me", headers=headers, timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                has_id = bool(data.get('id'))
                has_email = bool(data.get('email'))
                has_name = bool(data.get('name'))
                
                if has_id and has_email and has_name:
                    details = f"User data retrieved. Email: {data.get('email')}"
                    self.log_test("Get current user", True, details)
                else:
                    missing = []
                    if not has_id: missing.append("id")
                    if not has_email: missing.append("email")
                    if not has_name: missing.append("name")
                    self.log_test("Get current user", False, f"Missing: {', '.join(missing)}")
            else:
                self.log_test("Get current user", False, f"Status: {response.status_code}")
                
        except Exception as e:
            self.log_test("Get current user", False, f"Error: {str(e)}")

    def test_protected_route_without_auth(self):
        """Test that email generation requires authentication"""
        try:
            test_data = {
                "sender_name": "Test",
                "sender_role": "Test",
                "sender_offer": "Test offer",
                "recipient_name": "Test",
                "recipient_role_company": "Test",
                "recipient_context": "Test"
            }
            
            # Try without Authorization header
            response = requests.post(f"{self.api_url}/generate-email", json=test_data, timeout=10)
            # Should return 403 or 401 for missing auth
            success = response.status_code in [401, 403]
            details = f"Status: {response.status_code} (expected 401/403 for missing auth)"
            self.log_test("Protected route without auth", success, details)
                
        except Exception as e:
            self.log_test("Protected route without auth", False, f"Error: {str(e)}")

    def test_email_generation_with_auth(self):
        """Test email generation with valid authentication"""
        if not self.auth_token:
            self.log_test("Email generation (with auth)", False, "No auth token available")
            return
            
        try:
            test_data = {
                "sender_name": "John Smith",
                "sender_role": "CEO",
                "sender_offer": "AI-powered sales automation platform that increases conversion rates by 40%",
                "recipient_name": "Sarah Johnson",
                "recipient_role_company": "VP Marketing at TechCorp",
                "recipient_context": "Recently posted about struggling with lead qualification and manual follow-ups on LinkedIn",
                "writing_style": "casual and friendly but professional"
            }
            
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            response = requests.post(f"{self.api_url}/generate-email", json=test_data, headers=headers, timeout=30)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                has_subject = bool(data.get('subject_line', '').strip())
                has_body = bool(data.get('email_body', '').strip())
                has_followup = bool(data.get('follow_up', '').strip())
                
                if has_subject and has_body and has_followup:
                    # Check for em dashes and jargon
                    body_text = data['email_body']
                    subject_text = data['subject_line']
                    followup_text = data['follow_up']
                    
                    has_em_dash = '—' in (body_text + subject_text + followup_text)
                    jargon_words = ['hectic', 'bandwidth', 'synergy', 'leverage', 'touch base', 'circle back', 'deep dive']
                    has_jargon = any(word in (body_text + subject_text + followup_text).lower() for word in jargon_words)
                    
                    body_word_count = len(body_text.split())
                    
                    quality_issues = []
                    if has_em_dash:
                        quality_issues.append("contains em dashes")
                    if has_jargon:
                        quality_issues.append("contains jargon")
                    if body_word_count > 120:
                        quality_issues.append(f"body too long ({body_word_count} words)")
                    
                    if quality_issues:
                        details = f"Generated but has issues: {', '.join(quality_issues)}"
                        self.log_test("Email generation (with auth)", False, details)
                    else:
                        details = f"Generated successfully. Body words: {body_word_count}, Quality: Good"
                        self.log_test("Email generation (with auth)", True, details)
                else:
                    missing = []
                    if not has_subject: missing.append("subject")
                    if not has_body: missing.append("body")
                    if not has_followup: missing.append("follow-up")
                    self.log_test("Email generation (with auth)", False, f"Missing: {', '.join(missing)}")
            else:
                error_msg = response.text[:200] if response.text else "No error message"
                self.log_test("Email generation (with auth)", False, f"Status: {response.status_code}, Error: {error_msg}")
                
        except Exception as e:
            self.log_test("Email generation (with auth)", False, f"Error: {str(e)}")

    def test_email_generation_without_style(self):
        """Test email generation without writing style (should use default)"""
        if not self.auth_token:
            self.log_test("Email generation (no style)", False, "No auth token available")
            return
            
        try:
            test_data = {
                "sender_name": "Alex Chen",
                "sender_role": "Sales Director", 
                "sender_offer": "Marketing automation tools",
                "recipient_name": "Mike Davis",
                "recipient_role_company": "CMO at StartupXYZ",
                "recipient_context": "Scaling marketing team, looking for efficiency tools"
                # No writing_style or writing_sample provided
            }
            
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            response = requests.post(f"{self.api_url}/generate-email", json=test_data, headers=headers, timeout=30)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                has_all_parts = all([
                    data.get('subject_line', '').strip(),
                    data.get('email_body', '').strip(), 
                    data.get('follow_up', '').strip()
                ])
                
                if has_all_parts:
                    # Check that it still sounds conversational (default style)
                    body_text = data['email_body'].lower()
                    sounds_natural = any(word in body_text for word in ['you', 'your', 'i', 'we', 'noticed', 'saw', 'help'])
                    
                    details = f"Generated without style. Natural tone: {'Yes' if sounds_natural else 'No'}"
                    self.log_test("Email generation (no style)", True, details)
                else:
                    self.log_test("Email generation (no style)", False, "Missing email parts")
            else:
                self.log_test("Email generation (no style)", False, f"Status: {response.status_code}")
                
        except Exception as e:
            self.log_test("Email generation (no style)", False, f"Error: {str(e)}")

    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Outbox Backend Tests (Iteration 2)")
        print("=" * 50)
        
        # Authentication tests
        print("\n🔐 Authentication Tests")
        self.test_user_registration()
        self.test_user_login()
        self.test_invalid_login()
        self.test_get_current_user()
        self.test_protected_route_without_auth()
        
        # Email generation tests (with auth)
        print("\n📧 Email Generation Tests")
        self.test_email_generation_with_auth()
        self.test_email_generation_without_style()
        
        # Summary
        print("\n" + "=" * 50)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print("⚠️  Some tests failed - check details above")
            return False

def main():
    tester = OutboxAPITester()
    success = tester.run_all_tests()
    
    # Save detailed results
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump({
            "summary": {
                "total_tests": tester.tests_run,
                "passed_tests": tester.tests_passed,
                "success_rate": f"{(tester.tests_passed/tester.tests_run*100):.1f}%" if tester.tests_run > 0 else "0%",
                "timestamp": datetime.now().isoformat(),
                "iteration": 2,
                "features_tested": [
                    "User registration",
                    "User login", 
                    "JWT authentication",
                    "Protected routes",
                    "Email generation with auth",
                    "Email quality (no em dashes, no jargon)",
                    "Default writing style"
                ]
            },
            "detailed_results": tester.test_results
        }, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())