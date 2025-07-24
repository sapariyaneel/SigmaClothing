// Simple event bus for cross-component communication
class EventBus {
    constructor() {
        this.events = {};
    }

    // Subscribe to an event
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);

        // Return unsubscribe function
        return () => {
            this.events[event] = this.events[event].filter(cb => cb !== callback);
        };
    }

    // Emit an event
    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(callback => callback(data));
        }
    }

    // Remove all listeners for an event
    off(event) {
        delete this.events[event];
    }

    // Remove all listeners
    clear() {
        this.events = {};
    }
}

// Create a singleton instance
const eventBus = new EventBus();

// Event types
export const EVENTS = {
    ORDER_STATUS_UPDATED: 'ORDER_STATUS_UPDATED',
    ORDER_CREATED: 'ORDER_CREATED',
    ORDER_CANCELLED: 'ORDER_CANCELLED',
    DASHBOARD_REFRESH: 'DASHBOARD_REFRESH'
};

export default eventBus;
