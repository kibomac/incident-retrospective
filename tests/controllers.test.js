import { createIncident, updateIncident, createActionItem, updateActionItem, deleteActionItem, getIncidents, getIncidentById, fetchFilteredIncidents, getActionItems, getUserByUsername } from '../src/controllers.js';
import db from '../db.js';

jest.mock('../db.js', () => ({
  query: jest.fn(),
}));

describe('Incident and Action Item Flow', () => {
  let incidentId;

  beforeEach(() => {
    jest.clearAllMocks(); 
  });

  it('should create a new incident and return an incident ID', async () => {
    const mockIncidentData = {
      title: 'Test Incident',
      description: 'This is a test incident',
      root_cause: 'Test Root Cause',
    };

    db.query.mockResolvedValueOnce([
      [{ id: 1001 }],
      {}
    ]);

    const result = await createIncident(mockIncidentData);

    expect(db.query).toHaveBeenCalledWith(
      'CALL CreateIncident(?, ?, ?)',
      ['Test Incident', 'This is a test incident', 'Test Root Cause']
    );
    expect(result).toEqual({ id: 1001 });
  });

  it('should throw an error if required fields are missing when creating an incident', async () => {
    const mockIncidentData = {
      title: 'Test Incident',
      // Missing description and root_cause
    };

    await expect(createIncident(mockIncidentData)).rejects.toThrow();
  });

  it('should update an existing incident', async () => {
    const updatedIncidentData = {
      title: 'Updated Test Incident',
      description: 'Updated description',
      root_cause: 'Updated Root Cause',
      status: 'In Progress',
    };
  
    db.query.mockResolvedValueOnce([[{ affectedRows: 1 }], {}]);
  
    const result = await updateIncident(4007, updatedIncidentData);
  
    expect(db.query).toHaveBeenCalledWith(
      'CALL UpdateIncident(?, ?, ?, ?, ?)',
      [4007, 'Updated Test Incident', 'Updated description', 'Updated Root Cause', 'In Progress']
    );
    expect(result).toEqual([{ affectedRows: 1 }]);
  });

  it('should create a new action item against an existing incident and return an action item ID', async () => {
    incidentId = 1001;
    
    const mockActionItemData = {
      incident_id: incidentId,
      action_item: 'Test Action Item',
      assigned_to: 'John Doe',
      due_date: '2025-04-30',
      status: 'Open',
    };

    db.query.mockResolvedValueOnce([[[{ id: 2001, incidentId: 1001 }]]]);

    const result = await createActionItem(mockActionItemData);

    expect(db.query).toHaveBeenCalledWith(
      'CALL CreateActionItem(?, ?, ?, ?, ?)',
      [incidentId, 'Test Action Item', 'John Doe', '2025-04-30', 'Open']
    );
    expect(result).toEqual({ id: 2001, incidentId: 1001 });
    actionItemId = result.id; 
  });

  it('should update an existing action item', async () => {
    const actionItemId = 2001; 

    const updatedActionItemData = {
      action_item: 'Updated Action Item',
      assigned_to: 'Jane Doe',
      due_date: '2025-05-01',
      status: 'In Progress',
    };

    db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const result = await updateActionItem(actionItemId, updatedActionItemData);

    expect(db.query).toHaveBeenCalledWith(
      'CALL UpdateActionItem(?, ?, ?, ?, ?)',
      [actionItemId, 'Updated Action Item', 'Jane Doe', '2025-05-01', 'In Progress']
    );
    expect(result).toEqual({ affectedRows: 1 });
  });

  it('should delete an existing action item', async () => {
    const actionItemId = 2001; 

    db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const result = await deleteActionItem(actionItemId);

    expect(db.query).toHaveBeenCalledWith(
      'CALL DeleteActionItem(?)',
      [actionItemId]
    );
    expect(result).toEqual({ affectedRows: 1 });
  });

  it('should handle edge case: trying to delete a non-existent action item', async () => {
    
    db.query.mockResolvedValueOnce([[], {}]);

    const result = await deleteActionItem(9999999); 

    expect(db.query).toHaveBeenCalledWith(
      'CALL DeleteActionItem(?)',
      [9999999]
    );
    expect(result).toEqual([]);
  });
  
});