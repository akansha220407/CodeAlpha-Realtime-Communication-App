import React, { useState, useEffect } from 'react';
import { fileAPI } from '../utils/api';
import { sendFileShared, onFileShared } from '../utils/socket';

const FileShare = ({ roomId }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadFiles();
    
    const handleFileShared = (data) => {
      setFiles(prev => [...prev, {
        ...data,
        shared: true,
        timestamp: new Date()
      }]);
    };

    onFileShared(handleFileShared);

    return () => {
      // Cleanup if needed
    };
  }, [roomId]);

  const loadFiles = async () => {
    try {
      const response = await fileAPI.list();
      setFiles(response.data.files.map(file => ({
        ...file,
        shared: false
      })));
    } catch (error) {
      console.error('Error loading files:', error);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fileAPI.upload(formData);
      
      // Add to local list
      setFiles(prev => [...prev, {
        ...response.data,
        shared: false,
        timestamp: new Date()
      }]);

      // Share with room
      sendFileShared({
        filename: response.data.filename,
        originalName: response.data.originalName,
        size: response.data.size
      });

    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset file input
    }
  };

  const handleDownload = async (filename, originalName) => {
    try {
      const response = await fileAPI.download(filename);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', originalName || filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <div className="card">
      <h2>File Sharing</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <input
          type="file"
          onChange={handleFileUpload}
          disabled={uploading}
          style={{ display: 'none' }}
          id="file-upload"
        />
        <label htmlFor="file-upload" className="btn btn-primary">
          {uploading ? 'Uploading...' : 'Upload File'}
        </label>
      </div>

      <div className="file-list">
        {files.map((file, index) => (
          <div key={index} className="file-item">
            <div>
              <strong>{file.originalName || file.filename}</strong>
              <br />
              <small>
                {Math.round(file.size / 1024)} KB •{' '}
                {new Date(file.uploadedAt || file.timestamp).toLocaleString()}
                {file.shared && ' • Shared in room'}
              </small>
            </div>
            <button
              onClick={() => handleDownload(file.filename, file.originalName)}
              className="btn btn-secondary"
            >
              Download
            </button>
          </div>
        ))}
        
        {files.length === 0 && (
          <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
            No files shared yet
          </p>
        )}
      </div>
    </div>
  );
};

export default FileShare;
