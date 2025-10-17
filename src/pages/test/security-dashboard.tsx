import Head from "next/head";
import { useState, useEffect } from "react";
import { Header } from "@/components/Layout/Header";
import { Footer } from "@/components/Layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Download,
  Shield,
  Lock,
  Eye,
  Zap,
  Bug,
  FileText
} from "lucide-react";

interface TestCheck {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
}

interface TestResult {
  test: string;
  status: 'pass' | 'fail' | 'warning';
  checks: TestCheck[];
  summary: string;
}

const testEndpoints = [
  { name: 'Configuration Validation', endpoint: '/api/test/config-validation', icon: Shield },
  { name: 'Security Headers', endpoint: '/api/test/security-headers', icon: Lock },
  { name: 'Authentication Middleware', endpoint: '/api/test/auth-test', icon: Eye },
  { name: 'Input Validation', endpoint: '/api/test/validation-test', icon: FileText },
  { name: 'Rate Limiting', endpoint: '/api/test/rate-limit-test', icon: Zap },
  { name: 'CSRF Protection', endpoint: '/api/test/csrf-test', icon: Bug },
];

export default function SecurityDashboard() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [lastRun, setLastRun] = useState<Date | null>(null);

  const runAllTests = async () => {
    setIsRunning(true);
    const results: TestResult[] = [];

    for (const test of testEndpoints) {
      try {
        const response = await fetch(test.endpoint);
        if (response.ok) {
          const result = await response.json();
          results.push(result);
        } else {
          results.push({
            test: test.name,
            status: 'fail',
            checks: [{
              name: 'API Response',
              status: 'fail',
              message: `HTTP ${response.status}: ${response.statusText}`
            }],
            summary: 'Failed to fetch test results'
          });
        }
      } catch (error) {
        results.push({
          test: test.name,
          status: 'fail',
          checks: [{
            name: 'Network Error',
            status: 'fail',
            message: error.message
          }],
          summary: 'Network error occurred'
        });
      }
    }

    setTestResults(results);
    setLastRun(new Date());
    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pass':
        return <Badge className="bg-green-600">PASS</Badge>;
      case 'fail':
        return <Badge className="bg-red-600">FAIL</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-600">WARNING</Badge>;
      default:
        return <Badge className="bg-gray-600">UNKNOWN</Badge>;
    }
  };

  const getCheckStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    }
  };

  const exportResults = () => {
    const exportData = {
      timestamp: lastRun?.toISOString(),
      environment: process.env.NODE_ENV,
      results: testResults
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-test-results-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getOverallStatus = () => {
    if (testResults.length === 0) return 'unknown';
    
    const hasFailures = testResults.some(result => result.status === 'fail');
    const hasWarnings = testResults.some(result => result.status === 'warning');
    
    if (hasFailures) return 'fail';
    if (hasWarnings) return 'warning';
    return 'pass';
  };

  const getOverallStats = () => {
    const totalChecks = testResults.reduce((sum, result) => sum + result.checks.length, 0);
    const passedChecks = testResults.reduce((sum, result) => 
      sum + result.checks.filter(check => check.status === 'pass').length, 0
    );
    const failedChecks = testResults.reduce((sum, result) => 
      sum + result.checks.filter(check => check.status === 'fail').length, 0
    );
    const warningChecks = testResults.reduce((sum, result) => 
      sum + result.checks.filter(check => check.status === 'warning').length, 0
    );

    return { totalChecks, passedChecks, failedChecks, warningChecks };
  };

  const stats = getOverallStats();

  return (
    <>
      <Head>
        <title>Security Test Dashboard | CebuFlexi Tours</title>
        <meta name="description" content="Security configuration test dashboard for CebuFlexi Tours" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <Header />

      <main className="pt-20 min-h-screen bg-gray-50">
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2">Security Test Dashboard</h1>
              <p className="text-gray-600">Comprehensive security configuration validation</p>
            </div>

            {/* Overall Status */}
            <div className="mb-8">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      {getStatusIcon(getOverallStatus())}
                      <span className="ml-2">Overall Security Status</span>
                    </CardTitle>
                    {getStatusBadge(getOverallStatus())}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{stats.totalChecks}</div>
                      <div className="text-sm text-gray-600">Total Checks</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{stats.passedChecks}</div>
                      <div className="text-sm text-gray-600">Passed</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{stats.failedChecks}</div>
                      <div className="text-sm text-gray-600">Failed</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{stats.warningChecks}</div>
                      <div className="text-sm text-gray-600">Warnings</div>
                    </div>
                  </div>
                  
                  {lastRun && (
                    <p className="text-sm text-gray-600">
                      Last run: {lastRun.toLocaleString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="mb-8 flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={runAllTests} 
                disabled={isRunning}
                className="flex items-center"
                size="lg"
              >
                {isRunning ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                {isRunning ? 'Running Tests...' : 'Run All Tests'}
              </Button>
              
              {testResults.length > 0 && (
                <Button 
                  onClick={exportResults}
                  variant="outline"
                  className="flex items-center"
                  size="lg"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Results
                </Button>
              )}
            </div>

            {/* Test Results */}
            {testResults.length > 0 && (
              <div className="space-y-6">
                {testResults.map((result, index) => {
                  const testConfig = testEndpoints[index];
                  const IconComponent = testConfig.icon;
                  
                  return (
                    <Card key={index}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center">
                            <IconComponent className="h-5 w-5 mr-2" />
                            {result.test}
                          </CardTitle>
                          {getStatusBadge(result.status)}
                        </div>
                        <p className="text-sm text-gray-600">{result.summary}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {result.checks.map((check, checkIndex) => (
                            <div key={checkIndex} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                              {getCheckStatusIcon(check.status)}
                              <div className="flex-1">
                                <h4 className="font-medium text-sm">{check.name}</h4>
                                <p className="text-sm text-gray-600">{check.message}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Instructions */}
            {testResults.length === 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Getting Started</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        This dashboard tests your security configuration. Make sure your environment variables are properly configured before running tests.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="space-y-2">
                      <h4 className="font-semibold">Test Categories:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                        <li><strong>Configuration Validation:</strong> Checks environment variables and Firebase setup</li>
                        <li><strong>Security Headers:</strong> Validates HTTP security headers</li>
                        <li><strong>Authentication Middleware:</strong> Tests Firebase Admin SDK and auth middleware</li>
                        <li><strong>Input Validation:</strong> Checks Zod schemas and sanitization</li>
                        <li><strong>Rate Limiting:</strong> Tests rate limiting functionality</li>
                        <li><strong>CSRF Protection:</strong> Validates CSRF token system</li>
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold">Status Meanings:</h4>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                          <span>Pass - Working correctly</span>
                        </div>
                        <div className="flex items-center">
                          <AlertTriangle className="h-4 w-4 text-yellow-600 mr-1" />
                          <span>Warning - Needs attention</span>
                        </div>
                        <div className="flex items-center">
                          <XCircle className="h-4 w-4 text-red-600 mr-1" />
                          <span>Fail - Must be fixed</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
