import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import * as api from '@/lib/api';

interface MoveKeyModalProps {
  isOpen: boolean;
  keyPath: string;
  sourceProjectName: string;
  sourceNamespace: string;
  onClose: () => void;
  onMove: (targetProjectName: string, targetNamespace: string) => Promise<boolean>;
}

const MoveKeyModal: React.FC<MoveKeyModalProps> = ({
  isOpen,
  keyPath,
  sourceProjectName,
  sourceNamespace,
  onClose,
  onMove
}) => {
  const [projects, setProjects] = useState<{ name: string }[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>(sourceProjectName);
  const [namespaces, setNamespaces] = useState<string[]>([]);
  const [selectedNamespace, setSelectedNamespace] = useState<string>(sourceNamespace);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      fetchProjects();
      setSelectedProject(sourceProjectName);
      setSelectedNamespace(sourceNamespace);
      
      // Also fetch the namespaces for the source project when modal opens
      if (sourceProjectName) {
        fetchNamespaces(sourceProjectName);
      }
    }
  }, [isOpen, sourceProjectName, sourceNamespace]);

  // Fetch namespaces when project changes
  useEffect(() => {
    if (selectedProject) {
      fetchNamespaces(selectedProject);
    }
  }, [selectedProject]);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const response = await api.getProjects();
      setProjects(response.data.data || []);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setIsLoading(false);
    }
  };

  const fetchNamespaces = async (projectName: string) => {
    if (!projectName) return;
    
    setIsLoading(true);
    try {
      const response = await api.getNamespaces(projectName, 'en'); // Use 'en' as the base language to get namespaces
      
      // Make sure we're getting the right format from the API
      let namespaceList = [];
      if (Array.isArray(response.data.data)) {
        namespaceList = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        namespaceList = response.data;
      } else {
        console.error('Unexpected namespaces response format:', response);
        namespaceList = [];
      }
      
      console.log('Fetched namespaces:', namespaceList);
      setNamespaces(namespaceList);
      
      // If it's a different project, reset the selected namespace to the first one in the list
      if (projectName !== sourceProjectName) {
        if (namespaceList.length > 0) {
          setSelectedNamespace(namespaceList[0]);
        } else {
          setSelectedNamespace('');
        }
      } else {
        // For the same project, default to the current namespace
        setSelectedNamespace(sourceNamespace);
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching namespaces:', err);
      setNamespaces([]); // Ensure namespaces is at least an empty array on error
      setSelectedNamespace('');
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProject || !selectedNamespace) {
      setError('Please select both a project and namespace');
      return;
    }
    
    // Don't allow moving to the same location
    const isSameLocation = 
      selectedProject === sourceProjectName &&
      selectedNamespace === sourceNamespace;
    if (isSameLocation) {
      setError('Cannot move to the same namespace');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const success = await onMove(selectedProject, selectedNamespace);
      if (success) {
        onClose();
      } else {
        setError('Failed to move key');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setSelectedProject(sourceProjectName);
    setSelectedNamespace(sourceNamespace);
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Move Translation Key">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-800 dark:text-gray-300 mb-1">
              Current Location
            </label>
            <div className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded text-gray-800 dark:text-gray-200 text-sm mb-3 border border-gray-300 dark:border-gray-700">
              Project: <span className="font-medium">{sourceProjectName}</span><br/>
              Namespace: <span className="font-medium">{sourceNamespace}</span>
            </div>
          </div>
          
          <div className="mb-3">
            <label htmlFor="targetProject" className="block text-sm font-medium text-gray-800 dark:text-gray-300 mb-1">
              Key to Move
            </label>
            <div className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded text-gray-800 dark:text-gray-200 text-sm font-mono mb-3 border border-gray-300 dark:border-gray-700">
              {keyPath}
            </div>
          </div>
          
          <div className="mb-3">
            <label htmlFor="targetProject" className="block text-sm font-medium text-gray-800 dark:text-gray-300 mb-1">
              Target Project
            </label>
            <select
              id="targetProject"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="select text-sm w-full"
              disabled={isLoading}
            >
              {projects.map((project) => (
                <option key={project.name} value={project.name}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-3">
            <label htmlFor="targetNamespace" className="block text-sm font-medium text-gray-800 dark:text-gray-300 mb-1">
              Target Namespace
            </label>
            <select
              id="targetNamespace"
              value={selectedNamespace}
              onChange={(e) => setSelectedNamespace(e.target.value)}
              className="select text-sm w-full"
              disabled={isLoading}
            >
              {namespaces.length > 0 ? (
                namespaces.map((namespace) => (
                  <option key={namespace} value={namespace}>
                    {namespace}
                  </option>
                ))
              ) : (
                <option value="" disabled>No namespaces available</option>
              )}
            </select>
          </div>
        </div>
        
        {error && (
          <div className="text-red-600 dark:text-red-400 text-sm mb-4">
            {error}
          </div>
        )}
        
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={handleCancel}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="btn btn-primary"
          >
            {isSubmitting ? 'Moving...' : 'Move Key'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default MoveKeyModal;
