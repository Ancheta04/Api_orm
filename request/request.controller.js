// request.controller.js

const RequestService = require('./request.service');

/**
 * Request Controller Layer: Handles incoming HTTP requests and sends responses.
 * It primarily calls the Service layer for business logic.
 */
class RequestController {

    /**
     * Handles GET /api/requests
     * Fetches and returns all requests.
     */
    static async getRequests(req, res) {
        try {
            const allRequests = await RequestService.getAllRequests();
            
            // Simulating the data needed to display the table in the picture
            const formattedRequests = allRequests.map(req => ({
                Type: req.type,
                Employee: `${req.employeeEmail} (${req.employeeRole})`,
                Items: req.items,
                Status: req.status,
                Actions: { id: req.id, canEdit: true } // Placeholder for front-end actions
            }));

            // In a real app, this would send a JSON response to the client
            // The client (front-end) would then render the HTML table.
            res.status(200).json(formattedRequests); 

        } catch (error) {
            console.error('Error fetching requests:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    /**
     * Handles POST /api/requests
     * Creates a new request.
     */
    static async createNewRequest(req, res) {
        // In a real app, you'd validate req.body data
        const requestData = req.body; 

        try {
            const newRequest = await RequestService.createRequest(requestData);
            res.status(201).json({ 
                message: 'Request successfully created', 
                request: newRequest 
            });
        } catch (error) {
            console.error('Error creating request:', error);
            res.status(400).json({ message: 'Invalid request data' });
        }
    }

    /**
     * Handles PUT /api/requests/:id
     * Updates an existing request.
     */
    static async updateRequest(req, res) {
        const { id } = req.params;
        const updateData = req.body;

        try {
            const updatedRequest = await RequestService.updateRequest(id, updateData);
            
            if (!updatedRequest) {
                return res.status(404).json({ message: 'Request not found' });
            }
            
            res.status(200).json({ 
                message: 'Request successfully updated', 
                request: updatedRequest 
            });
        } catch (error) {
            console.error('Error updating request:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    // You would typically define a function to *render* the HTML page 
    // that contains the table, but in a standard API structure, 
    // the Controller just sends the data (JSON) to the client.
}

// In your main Express app file, you would define routes:
// router.get('/requests', RequestController.getRequests);
// router.post('/requests', RequestController.createNewRequest);

module.exports = RequestController;