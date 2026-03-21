import requests
import sys
import json
from datetime import datetime

class ColdEmailAPITester:
    def __init__(self, base_url="https://email-craft-pro.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

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

    def test_root_endpoint(self):
        """Test root API endpoint"""
        try:
            response = requests.get(f"{self.api_url}/", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}, Response: {response.json() if success else response.text}"
            self.log_test("Root endpoint", success, details)
            return success
        except Exception as e:
            self.log_test("Root endpoint", False, f"Error: {str(e)}")
            return False

    def test_status_endpoints(self):
        """Test status check endpoints"""
        # Test POST /status
        try:
            test_data = {"client_name": f"test_client_{datetime.now().strftime('%H%M%S')}"}
            response = requests.post(f"{self.api_url}/status", json=test_data, timeout=10)
            success = response.status_code == 200
            details = f"POST Status: {response.status_code}"
            if success:
                data = response.json()
                details += f", ID: {data.get('id', 'N/A')}"
            self.log_test("POST /status", success, details)
        except Exception as e:
            self.log_test("POST /status", False, f"Error: {str(e)}")

        # Test GET /status
        try:
            response = requests.get(f"{self.api_url}/status", timeout=10)
            success = response.status_code == 200
            details = f"GET Status: {response.status_code}"
            if success:
                data = response.json()
                details += f", Records: {len(data)}"
            self.log_test("GET /status", success, details)
        except Exception as e:
            self.log_test("GET /status", False, f"Error: {str(e)}")

    def test_email_generation_valid_request(self):
        """Test email generation with valid data"""
        try:
            test_data = {
                "sender_name": "John Smith",
                "sender_role": "CEO",
                "sender_offer": "AI-powered sales automation platform that increases conversion rates by 40%",
                "recipient_name": "Sarah Johnson",
                "recipient_role_company": "VP Marketing at TechCorp",
                "recipient_context": "Recently posted about struggling with lead qualification and manual follow-ups on LinkedIn",
                "writing_style": "casual and friendly but professional",
                "writing_sample": None
            }
            
            response = requests.post(f"{self.api_url}/generate-email", json=test_data, timeout=30)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                has_subject = bool(data.get('subject_line', '').strip())
                has_body = bool(data.get('email_body', '').strip())
                has_followup = bool(data.get('follow_up', '').strip())
                
                if has_subject and has_body and has_followup:
                    # Check word count for body (should be under 120 words)
                    body_word_count = len(data['email_body'].split())
                    details = f"Generated successfully. Body words: {body_word_count}, Subject: '{data['subject_line'][:50]}...'"
                    self.log_test("Email generation (valid request)", True, details)
                else:
                    missing = []
                    if not has_subject: missing.append("subject")
                    if not has_body: missing.append("body")
                    if not has_followup: missing.append("follow-up")
                    self.log_test("Email generation (valid request)", False, f"Missing: {', '.join(missing)}")
            else:
                error_msg = response.text[:200] if response.text else "No error message"
                self.log_test("Email generation (valid request)", False, f"Status: {response.status_code}, Error: {error_msg}")
                
        except Exception as e:
            self.log_test("Email generation (valid request)", False, f"Error: {str(e)}")

    def test_email_generation_with_sample(self):
        """Test email generation with writing sample"""
        try:
            test_data = {
                "sender_name": "Alex Chen",
                "sender_role": "Sales Director",
                "sender_offer": "Marketing automation tools",
                "recipient_name": "Mike Davis",
                "recipient_role_company": "CMO at StartupXYZ",
                "recipient_context": "Scaling marketing team, looking for efficiency tools",
                "writing_style": "witty and conversational",
                "writing_sample": "Hey there! Hope you're crushing it this week. I noticed you've been posting about team scaling challenges - been there, done that, got the t-shirt (and the stress wrinkles to prove it)."
            }
            
            response = requests.post(f"{self.api_url}/generate-email", json=test_data, timeout=30)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                details = f"Generated with sample. Subject: '{data.get('subject_line', '')[:30]}...'"
                self.log_test("Email generation (with sample)", True, details)
            else:
                self.log_test("Email generation (with sample)", False, f"Status: {response.status_code}")
                
        except Exception as e:
            self.log_test("Email generation (with sample)", False, f"Error: {str(e)}")

    def test_email_generation_missing_fields(self):
        """Test email generation with missing required fields"""
        try:
            # Missing sender_name
            test_data = {
                "sender_role": "CEO",
                "sender_offer": "Test offer",
                "recipient_name": "Test Recipient",
                "recipient_role_company": "Test Company",
                "recipient_context": "Test context",
                "writing_style": "professional"
            }
            
            response = requests.post(f"{self.api_url}/generate-email", json=test_data, timeout=10)
            # Should return 422 for validation error
            success = response.status_code == 422
            details = f"Status: {response.status_code} (expected 422 for missing field)"
            self.log_test("Email generation (missing fields)", success, details)
                
        except Exception as e:
            self.log_test("Email generation (missing fields)", False, f"Error: {str(e)}")

    def test_api_key_functionality(self):
        """Test if API key is working by making a simple request"""
        try:
            # This is an indirect test - if email generation works, API key is valid
            test_data = {
                "sender_name": "Test",
                "sender_role": "Test",
                "sender_offer": "Test offer",
                "recipient_name": "Test",
                "recipient_role_company": "Test",
                "recipient_context": "Test",
                "writing_style": "professional"
            }
            
            response = requests.post(f"{self.api_url}/generate-email", json=test_data, timeout=20)
            
            if response.status_code == 500:
                error_text = response.text.lower()
                if "api key" in error_text or "unauthorized" in error_text:
                    self.log_test("API key functionality", False, "API key issue detected")
                else:
                    self.log_test("API key functionality", False, f"Server error: {response.text[:100]}")
            elif response.status_code == 200:
                self.log_test("API key functionality", True, "API key working correctly")
            else:
                self.log_test("API key functionality", False, f"Unexpected status: {response.status_code}")
                
        except Exception as e:
            self.log_test("API key functionality", False, f"Error: {str(e)}")

    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Cold Email Machine Backend Tests")
        print("=" * 50)
        
        # Basic connectivity
        if not self.test_root_endpoint():
            print("❌ Root endpoint failed - stopping tests")
            return False
            
        # Status endpoints
        self.test_status_endpoints()
        
        # Email generation tests
        self.test_api_key_functionality()
        self.test_email_generation_valid_request()
        self.test_email_generation_with_sample()
        self.test_email_generation_missing_fields()
        
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
    tester = ColdEmailAPITester()
    success = tester.run_all_tests()
    
    # Save detailed results
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump({
            "summary": {
                "total_tests": tester.tests_run,
                "passed_tests": tester.tests_passed,
                "success_rate": f"{(tester.tests_passed/tester.tests_run*100):.1f}%" if tester.tests_run > 0 else "0%",
                "timestamp": datetime.now().isoformat()
            },
            "detailed_results": tester.test_results
        }, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())