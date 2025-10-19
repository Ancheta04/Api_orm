// request.model.js

// Conceptual Schema for a Request
// In a real application, you'd use a library like Mongoose (MongoDB) 
// or Sequelize (SQL) to define this structure.

const requests = [
    {
        id: 'req1',
        type: 'Equipment',
        employeeEmail: 'user@example.com',
        employeeRole: 'Normal User',
        items: 'Laptop (x1)',
        status: 'Pending',
        // Other fields like dateCreated, employeeId, etc., would be here
    },
    {
        id: 'req2',
        type: 'Leave',
        employeeEmail: 'admin@example.com',
        employeeRole: 'Admin User',
        items: 'Vacation (x5)', // Assuming 'x5' means 5 days/units
        status: 'Approved',
    },
    // ... potentially more mock data
];

/**
 * Class representing a Request Model.
 * Provides a formal structure for Request data, 
 * simulating a database model.
 */
class Request {
    constructor(data) {
        this.id = data.id || Math.random().toString(36).substring(2, 9); // Simple unique ID generation
        this.type = data.type;
        this.employeeEmail = data.employeeEmail;
        this.employeeRole = data.employeeRole || 'Normal User';
        this.items = data.items;
        this.status = data.status || 'Pending'; // Default to Pending
    }

    // In a real app, you'd export a Mongoose Model here.
}

// Export the mock data for demonstration
module.exports = {
    Request,
    requests // Mock data store
};