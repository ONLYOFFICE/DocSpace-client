# DocSpace Translation App Backend: Development Plan

## Overview

This document outlines the development plan for the DocSpace Translation App backend, tracking completed and pending tasks for the project.

## Completed Tasks

### Core Infrastructure

- [x] Set up Fastify server with proper configuration
- [x] Configure Socket.IO for real-time updates
- [x] Implement project configuration handling
- [x] Add environment variable support using dotenv
- [x] Create basic health check endpoints

### File System Utilities

- [x] Implement project path resolution functionality
- [x] Create language directory management utilities
- [x] Build namespace file handling functions
- [x] Implement translation file read/write operations
- [x] Add file validation functionality
- [x] Create empty translation generator utility
- [x] Add support for recursive directory traversal

### API Routes

- [x] Implement Projects API endpoints
  - [x] GET /api/projects (list all projects)
  - [x] GET /api/projects/:projectName (get project details)

- [x] Implement Languages API endpoints
  - [x] GET /api/languages/:projectName (list languages)
  - [x] POST /api/languages/:projectName (add language)

- [x] Implement Namespaces API endpoints
  - [x] GET /api/namespaces/:projectName/:language (list namespaces)
  - [x] POST /api/namespaces/:projectName (create namespace)
  - [x] PUT /api/namespaces/:projectName/rename (rename namespace)
  - [x] PUT /api/namespaces/:projectName/move (move namespace)
  - [x] DELETE /api/namespaces/:projectName/:namespace (delete namespace)

- [x] Implement Translations API endpoints
  - [x] GET /api/translations/stats (get statistics)
  - [x] GET /api/translations/stats/:projectName (project statistics)
  - [x] GET /api/translations/:projectName/:language/:namespace (get translations)
  - [x] PUT /api/translations/:projectName/:language/:namespace (update translations)
  - [x] PUT /api/translations/:projectName/:language/:namespace/key (update key)
  - [x] PUT /api/translations/:projectName/rename-key (rename key)
  - [x] POST /api/translations/:projectName/copy-translations (copy translations)
  - [x] DELETE /api/translations/:projectName/:namespace/key (delete key)

### Ollama AI Integration

- [x] Implement Ollama connection validation
- [x] Add model listing functionality
- [x] Create text translation capability
- [x] Build validation service for translations
- [x] Add namespace batch translation
- [x] Implement language detection and naming utilities

### Real-time Updates

- [x] Configure Socket.IO event system
- [x] Add events for language operations
- [x] Add events for namespace operations
- [x] Add events for translation operations
- [x] Implement progress notification for long-running tasks

## Pending Tasks

### SQLite Database Integration

- [ ] Set up SQLite database with better-sqlite3
  - [ ] Create database initialization script
  - [ ] Implement connection management
  - [ ] Add migration framework for schema updates

- [ ] Design and implement database schema
  - [ ] Create translations_metadata table for core metadata
  - [ ] Create figma_references table for Figma integration
  - [ ] Create comments table for translation key discussions
  - [ ] Create code_usages table to track where keys are used in code
  - [ ] Create approvals table for translation review workflow
  - [ ] Create history table for auditing changes

- [ ] Develop database utility layer
  - [ ] Create CRUD operations for each table
  - [ ] Implement query builders for complex queries
  - [ ] Add transaction support for multi-step operations
  - [ ] Build data validation middleware

- [ ] Create metadata API endpoints
  - [ ] GET/POST/PUT /api/metadata/:projectName/:language/:namespace/key (manage metadata)
  - [ ] GET/POST /api/comments/:projectName/:language/:namespace/key (manage comments)
  - [ ] GET/POST /api/figma/:projectName/:language/:namespace/key (manage Figma references)
  - [ ] GET/POST /api/code-usages/:projectName (manage code usage tracking)
  - [ ] GET/PUT /api/approvals/:projectName/:language/:namespace/key (manage approval status)
  - [ ] GET /api/history/:projectName/:language/:namespace/key (view change history)

- [ ] Enhance existing APIs with metadata integration
  - [ ] Add metadata to translation responses
  - [ ] Update translations and metadata in a single transaction
  - [ ] Implement filtering and sorting based on metadata

- [ ] Implement Figma integration features
  - [ ] Store Figma file references and node IDs
  - [ ] Create thumbnails API for Figma previews
  - [ ] Add comment synchronization with Figma

- [ ] Add code usage analysis
  - [ ] Create parser for code files to extract translation keys
  - [ ] Implement automatic code reference updating
  - [ ] Add unused key detection

- [ ] Develop approval workflow
  - [ ] Implement multi-stage approval process
  - [ ] Add reviewer assignment functionality
  - [ ] Create notification system for pending approvals

### Enhanced Error Handling

- [ ] Implement consistent error handling across all routes
- [ ] Add detailed error logging system
- [ ] Create client-friendly error messages

### Performance Optimization

- [ ] Add caching for frequently accessed translations and metadata
- [ ] Optimize batch processing for large translation sets
- [ ] Improve file system operations for large projects
- [ ] Implement database query optimization techniques

### Security Enhancements

- [ ] Add request validation middleware
- [ ] Implement rate limiting for API endpoints
- [ ] Add authentication support (if needed)
- [ ] Add role-based access control for approvals

### Testing

- [ ] Create unit tests for utility functions
- [ ] Build integration tests for API endpoints
- [ ] Set up end-to-end testing for complete workflows
- [ ] Add test coverage reporting
- [ ] Create database schema validation tests

### Documentation

- [ ] Generate API documentation from JSDoc comments
- [ ] Create user guide for backend services
- [ ] Add contribution guidelines for developers
- [ ] Document database schema and relationships
- [ ] Create metadata field reference guide

## Next Steps

1. Set up SQLite database infrastructure
2. Implement core metadata tables and APIs
3. Add Figma and code usage integration
4. Develop approval workflow system
5. Enhance existing APIs with metadata
6. Implement performance optimizations
7. Complete comprehensive test coverage
8. Generate complete documentation
