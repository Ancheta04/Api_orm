// request.service.js

const { requests, Request } = require('./request.model');

/**
 * Request Service Layer: Handles data access and business logic.
 */
class RequestService {

    /**
     * Gets all requests, simulating a database query.
     * @returns {Array} List of all requests.
     */
    static async getAllRequests() {
        // In a real app: return RequestModel.find({});
        return requests; 
    }

    /**
     * Gets a single request by its ID.
     * @param {string} id - The ID of the request to fetch.
     * @returns {Object|null} The request object or null if not found.
     */
    static async getRequestById(id) {
        // In a real app: return RequestModel.findById(id);
        return requests.find(req => req.id === id);
    }

    /**
     * Creates a new request.
     * @param {Object} requestData - Data for the new request (type, employee, items).
     * @returns {Object} The newly created request object.
     */
    static async createRequest(requestData) {
        // In a real app: const newRequest = new RequestModel(requestData); return newRequest.save();
        const newRequest = new Request(requestData);
        requests.push(newRequest); // Add to mock data store
        return newRequest;
    }

    /**
     * Updates an existing request's status or details.
     * @param {string} id - The ID of the request to update.
     * @param {Object} updateData - Fields to update.
     * @returns {Object|null} The updated request object or null if not found.
     */
    static async updateRequest(id, updateData) {
        // In a real app: return RequestModel.findByIdAndUpdate(id, updateData, { new: true });
        const requestIndex = requests.findIndex(req => req.id === id);
        
        if (requestIndex === -1) return null;

        // Merge existing data with new data
        requests[requestIndex] = { ...requests[requestIndex], ...updateData };
        return requests[requestIndex];
    }
}

module.exports = RequestService;