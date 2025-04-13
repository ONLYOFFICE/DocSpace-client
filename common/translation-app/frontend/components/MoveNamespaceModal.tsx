import React, { useState, useEffect } from 'react';
import * as api from '@/lib/api';

interface Project {
  name: string;
  path: string;
}

interface MoveNamespaceModalProps {
  isOpen: boolean;
  sourceProjectName: string;
  sourceNamespace: string;
  availableNamespaces: string[];
  onClose: () => void;
  onMove: (sourceNamespace: string, targetProjectName: string, targetNamespace: string) => Promise<void>;
}

const MoveNamespaceModal: React.FC<MoveNamespaceModalProps> = ({
  isOpen,
  sourceProjectName,
  sourceNamespace,
  availableNamespaces,
  onClose,
  onMove
}) => {
  const [targetProjectName, setTargetProjectName] = useState<string>(sourceProjectName);
  const [targetNamespace, setTargetNamespace] = useState<string>('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [targetProjectNamespaces, setTargetProjectNamespaces] = useState<string[]>([]);
  const [isLoadingNamespaces, setIsLoadingNamespaces] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filter out the source namespace from available targets when the target project is the same as source
  const availableTargetNamespaces = targetProjectName === sourceProjectName
    ? availableNamespaces.filter(ns => ns !== sourceNamespace)
    : targetProjectNamespaces;
    
  // Load projects when modal opens
  useEffect(() => {
    if (isOpen) {
      // Reset states
      setTargetProjectName(sourceProjectName);
      setTargetNamespace('');
      setError(null);
      
      // Load projects
      const fetchProjects = async () => {
        try {
          const response = await api.getProjects();
          if (response.data.success) {
            setProjects(response.data.data || []);
          }
        } catch (err) {
          console.error('Error fetching projects:', err);
        }
      };
      
      fetchProjects();
    }
  }, [isOpen, sourceProjectName]);
  
  // Load namespaces for selected target project
  useEffect(() => {
    if (!targetProjectName || targetProjectName === sourceProjectName) {
      return;
    }
    
    const fetchNamespaces = async () => {
      setIsLoadingNamespaces(true);
      try {
        // Here we assume we can use the base language (e.g., 'en') to get the list of namespaces
        // This would need to be adjusted if a specific language needs to be passed
        const response = await api.getNamespaces(targetProjectName, 'en');
        if (response.data.success) {
          setTargetProjectNamespaces(response.data.data || []);
        }
      } catch (err) {
        console.error('Error fetching namespaces:', err);
        setTargetProjectNamespaces([]);
      } finally {
        setIsLoadingNamespaces(false);
      }
    };
    
    fetchNamespaces();
  }, [targetProjectName, sourceProjectName]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!targetNamespace) {
      setError('Please select a target namespace');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      await onMove(sourceNamespace, targetProjectName, targetNamespace);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to move namespace');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md text-gray-800 dark:text-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Move Namespace</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Source project</label>
            <input
              type="text"
              value={sourceProjectName}
              disabled
              className="input w-full opacity-70"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Source namespace</label>
            <input
              type="text"
              value={sourceNamespace}
              disabled
              className="input w-full opacity-70"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Target project</label>
            <select
              value={targetProjectName}
              onChange={(e) => {
                setTargetProjectName(e.target.value);
                setTargetNamespace(''); // Reset namespace selection when project changes
              }}
              className="input w-full"
              disabled={isSubmitting}
            >
              {projects.map(project => (
                <option key={project.name} value={project.name}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Target namespace</label>
            <select
              value={targetNamespace}
              onChange={(e) => setTargetNamespace(e.target.value)}
              className="input w-full"
              disabled={isSubmitting || isLoadingNamespaces}
              autoFocus
            >
              <option value="">Select target namespace</option>
              {availableTargetNamespaces.map(ns => (
                <option key={ns} value={ns}>
                  {ns}
                </option>
              ))}
            </select>
            
            {isLoadingNamespaces && (
              <p className="text-sm text-blue-600 mt-2">
                Loading namespaces...
              </p>
            )}
            
            {!isLoadingNamespaces && availableTargetNamespaces.length === 0 && (
              <p className="text-sm text-yellow-600 mt-2">
                No namespaces available. Please create a namespace first.
              </p>
            )}
          </div>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3 rounded-md mb-4">
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              All translation keys from <strong>{sourceNamespace}</strong> in project <strong>{sourceProjectName}</strong> will be moved to <strong>{targetNamespace || '[select namespace]'}</strong> in project <strong>{targetProjectName}</strong>.
              The source namespace will be deleted after the move.
            </p>
          </div>
          
          {error && (
            <div className="text-red-500 text-sm mb-4">{error}</div>
          )}
          
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || availableTargetNamespaces.length === 0 || !targetNamespace || isLoadingNamespaces}
              className="btn btn-primary"
            >
              {isSubmitting ? 'Moving...' : 'Move'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MoveNamespaceModal;
