import { makeAutoObservable } from "mobx";
import { api } from "@docspace/shared/api";

export class WorkflowManager {
  workflows = new Map();
  workflowStates = new Map();
  workflowAssignments = new Map();
  workflowHistory = new Map();

  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this, {
      rootStore: false
    });
  }

  // Workflow Management
  fetchWorkflows = async () => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "fetch-workflows",
        () => api.workflows.getWorkflows()
      );
      this.setWorkflows(response.data);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Fetch workflows");
      throw err;
    }
  };

  createWorkflow = async (workflowData) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "create-workflow",
        () => api.workflows.createWorkflow(workflowData)
      );
      this.addWorkflow(response.data);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Create workflow");
      throw err;
    }
  };

  updateWorkflow = async (workflowId, updates) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "update-workflow",
        () => api.workflows.updateWorkflow(workflowId, updates)
      );
      this.updateWorkflowInStore(response.data);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Update workflow");
      throw err;
    }
  };

  deleteWorkflow = async (workflowId) => {
    try {
      await this.rootStore.loadingManager.withLoading(
        "delete-workflow",
        () => api.workflows.deleteWorkflow(workflowId)
      );
      this.removeWorkflow(workflowId);
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Delete workflow");
      throw err;
    }
  };

  // Workflow State Management
  fetchWorkflowState = async (entityId) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "fetch-workflow-state",
        () => api.workflows.getWorkflowState(entityId)
      );
      this.setWorkflowState(entityId, response.data);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Fetch workflow state");
      throw err;
    }
  };

  updateWorkflowState = async (entityId, stateData) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "update-workflow-state",
        () => api.workflows.updateWorkflowState(entityId, stateData)
      );
      this.setWorkflowState(entityId, response.data);
      await this.updateWorkflowHistory(entityId);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Update workflow state");
      throw err;
    }
  };

  // Workflow Assignment Management
  assignWorkflow = async (entityId, assignmentData) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "assign-workflow",
        () => api.workflows.assignWorkflow(entityId, assignmentData)
      );
      this.setWorkflowAssignment(entityId, response.data);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Assign workflow");
      throw err;
    }
  };

  unassignWorkflow = async (entityId, assignmentId) => {
    try {
      await this.rootStore.loadingManager.withLoading(
        "unassign-workflow",
        () => api.workflows.unassignWorkflow(entityId, assignmentId)
      );
      this.removeWorkflowAssignment(entityId, assignmentId);
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Unassign workflow");
      throw err;
    }
  };

  // Workflow History Management
  fetchWorkflowHistory = async (entityId) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "fetch-workflow-history",
        () => api.workflows.getWorkflowHistory(entityId)
      );
      this.setWorkflowHistory(entityId, response.data);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Fetch workflow history");
      throw err;
    }
  };

  // Local state management
  setWorkflows = (workflows) => {
    this.workflows.clear();
    workflows.forEach(workflow => {
      this.workflows.set(workflow.id, {
        ...workflow,
        created: new Date(workflow.created),
        modified: new Date(workflow.modified)
      });
    });
  };

  addWorkflow = (workflow) => {
    this.workflows.set(workflow.id, {
      ...workflow,
      created: new Date(workflow.created),
      modified: new Date(workflow.modified)
    });
  };

  updateWorkflowInStore = (workflow) => {
    this.workflows.set(workflow.id, {
      ...workflow,
      created: new Date(workflow.created),
      modified: new Date(workflow.modified)
    });
  };

  removeWorkflow = (workflowId) => {
    this.workflows.delete(workflowId);
  };

  setWorkflowState = (entityId, state) => {
    this.workflowStates.set(entityId, {
      ...state,
      lastUpdated: new Date(state.lastUpdated)
    });
  };

  setWorkflowAssignment = (entityId, assignment) => {
    const assignments = this.workflowAssignments.get(entityId) || new Map();
    assignments.set(assignment.id, {
      ...assignment,
      assigned: new Date(assignment.assigned)
    });
    this.workflowAssignments.set(entityId, assignments);
  };

  removeWorkflowAssignment = (entityId, assignmentId) => {
    const assignments = this.workflowAssignments.get(entityId);
    if (assignments) {
      assignments.delete(assignmentId);
      if (assignments.size === 0) {
        this.workflowAssignments.delete(entityId);
      }
    }
  };

  setWorkflowHistory = (entityId, history) => {
    const historyEntries = history.map(entry => ({
      ...entry,
      timestamp: new Date(entry.timestamp)
    }));
    this.workflowHistory.set(entityId, historyEntries);
  };

  addWorkflowHistoryEntry = (entityId, entry) => {
    const history = this.workflowHistory.get(entityId) || [];
    history.push({
      ...entry,
      timestamp: new Date(entry.timestamp)
    });
    this.workflowHistory.set(entityId, history);
  };

  // Computed values
  get workflowList() {
    return Array.from(this.workflows.values());
  }

  getWorkflow = (workflowId) => {
    return this.workflows.get(workflowId);
  };

  getWorkflowState = (entityId) => {
    return this.workflowStates.get(entityId);
  };

  getWorkflowAssignments = (entityId) => {
    const assignments = this.workflowAssignments.get(entityId);
    return assignments ? Array.from(assignments.values()) : [];
  };

  getWorkflowHistory = (entityId) => {
    return this.workflowHistory.get(entityId) || [];
  };

  clearAll = () => {
    this.workflows.clear();
    this.workflowStates.clear();
    this.workflowAssignments.clear();
    this.workflowHistory.clear();
  };
}

export default WorkflowManager;
