// src/components/debugging/ApiDiagnostic.jsx
import React, { useState } from 'react';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ApiDiagnostic = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const runTest = async (name, testFn) => {
    try {
      setLoading(true);
      const startTime = Date.now();
      const result = await testFn();
      const duration = Date.now() - startTime;
      
      setResults(prev => [
        { name, status: 'success', duration: `${duration}ms`, data: result, time: new Date().toLocaleTimeString() },
        ...prev
      ]);
    } catch (error) {
      setResults(prev => [
        { 
          name, 
          status: 'error', 
          error: error.message,
          response: error.response?.data,
          time: new Date().toLocaleTimeString()
        },
        ...prev
      ]);
    } finally {
      setLoading(false);
    }
  };

  const testUserProfile = () => {
    return runTest('Get User Profile', async () => {
      const { data } = await axios.get(`${BACKEND_URL}/api/users/profile`, { withCredentials: true });
      return data;
    });
  };

  const testConversations = () => {
    return runTest('Get Conversations', async () => {
      const { data } = await axios.get(`${BACKEND_URL}/api/conversations`, { withCredentials: true });
      return data;
    });
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">API Diagnostic Tool</h1>
      
      <div className="flex space-x-4 mb-6">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          onClick={testUserProfile}
          disabled={loading}
        >
          Test User Profile API
        </button>
        
        <button
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          onClick={testConversations}
          disabled={loading}
        >
          Test Conversations API
        </button>
        
        <button
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          onClick={clearResults}
        >
          Clear Results
        </button>
      </div>
      
      {loading && (
        <div className="mb-4 text-blue-600">
          Running test...
        </div>
      )}
      
      <div className="border rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {results.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">No test results yet</td>
              </tr>
            ) : (
              results.map((result, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.time}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{result.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      result.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {result.status}
                    </span>
                    {result.duration && <span className="ml-2 text-xs text-gray-500">{result.duration}</span>}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {result.status === 'success' ? (
                      <details>
                        <summary>View Response</summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    ) : (
                      <div>
                        <p className="text-red-600">{result.error}</p>
                        {result.response && (
                          <details>
                            <summary>View Response</summary>
                            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                              {JSON.stringify(result.response, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApiDiagnostic;