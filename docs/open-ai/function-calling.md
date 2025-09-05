# Function Calling with Realtime API

## Overview
Function calling enables Realtime models to execute custom code and access external systems during conversations. This powerful feature allows AI assistants to perform actions like database queries, API calls, calculations, and real-world integrations.

## How Function Calling Works

### Basic Flow
1. **Define Functions**: Configure available functions in session or response
2. **Model Decision**: AI decides when to call functions based on user input
3. **Function Execution**: Your code executes the function with provided arguments
4. **Return Results**: Function results are sent back to the model
5. **AI Response**: Model uses results to generate appropriate response

### Function Call Lifecycle
```
User Input → Model Analysis → Function Call → Code Execution → Results → AI Response
```

## Defining Functions

### Session-Level Functions
```javascript
const functionsConfig = {
    type: "session.update",
    session: {
        tools: [
            {
                type: "function",
                name: "get_weather",
                description: "Get current weather for a specific location",
                parameters: {
                    type: "object",
                    properties: {
                        location: {
                            type: "string",
                            description: "City name or address"
                        },
                        units: {
                            type: "string",
                            enum: ["celsius", "fahrenheit"],
                            description: "Temperature units"
                        }
                    },
                    required: ["location"]
                }
            },
            {
                type: "function",
                name: "calculate_tip",
                description: "Calculate tip amount for a bill",
                parameters: {
                    type: "object",
                    properties: {
                        bill_amount: {
                            type: "number",
                            description: "Total bill amount"
                        },
                        tip_percentage: {
                            type: "number",
                            description: "Tip percentage (default 18%)"
                        }
                    },
                    required: ["bill_amount"]
                }
            }
        ],
        tool_choice: "auto"  // auto, none, or specific function name
    }
};

dataChannel.send(JSON.stringify(functionsConfig));
```

### Response-Level Functions
```javascript
// Override functions for specific response
const responseWithTools = {
    type: "response.create",
    response: {
        tools: [
            {
                type: "function",
                name: "emergency_alert",
                description: "Send emergency alert to contacts",
                parameters: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                            description: "Emergency message to send"
                        },
                        severity: {
                            type: "string",
                            enum: ["low", "medium", "high", "critical"]
                        }
                    },
                    required: ["message", "severity"]
                }
            }
        ],
        tool_choice: "emergency_alert"  // Force specific function
    }
};

dataChannel.send(JSON.stringify(responseWithTools));
```

## Tool Choice Options

### Auto (Recommended)
```javascript
// Let the model decide when to use functions
{
    tool_choice: "auto"
}
```

### None
```javascript
// Disable function calling
{
    tool_choice: "none"
}
```

### Specific Function
```javascript
// Force a specific function to be called
{
    tool_choice: "get_weather"
}
```

## Handling Function Calls

### Basic Function Call Handler
```javascript
async function handleServerEvent(event) {
    if (event.type === 'response.done') {
        const output = event.response.output[0];
        
        if (output.type === 'function_call') {
            const { name, call_id, arguments: args } = output;
            
            try {
                // Parse arguments
                const parsedArgs = JSON.parse(args);
                
                // Execute function
                const result = await executeFunction(name, parsedArgs);
                
                // Send result back to model
                const functionResult = {
                    type: "conversation.item.create",
                    item: {
                        type: "function_call_output",
                        call_id: call_id,
                        output: JSON.stringify(result)
                    }
                };
                
                dataChannel.send(JSON.stringify(functionResult));
                
                // Generate response with function results
                dataChannel.send(JSON.stringify({
                    type: "response.create"
                }));
                
            } catch (error) {
                // Handle function execution errors
                const errorResult = {
                    type: "conversation.item.create",
                    item: {
                        type: "function_call_output",
                        call_id: call_id,
                        output: JSON.stringify({
                            error: error.message,
                            success: false
                        })
                    }
                };
                
                dataChannel.send(JSON.stringify(errorResult));
                dataChannel.send(JSON.stringify({
                    type: "response.create"
                }));
            }
        }
    }
}
```

### Function Registry System
```javascript
class FunctionRegistry {
    constructor() {
        this.functions = new Map();
        this.setupBuiltinFunctions();
    }
    
    setupBuiltinFunctions() {
        this.register('get_weather', this.getWeather);
        this.register('calculate_tip', this.calculateTip);
        this.register('get_time', this.getCurrentTime);
        this.register('search_web', this.searchWeb);
        this.register('send_email', this.sendEmail);
    }
    
    register(name, handler) {
        this.functions.set(name, handler);
    }
    
    async execute(name, args) {
        const handler = this.functions.get(name);
        if (!handler) {
            throw new Error(`Function '${name}' not found`);
        }
        
        return await handler(args);
    }
    
    // Built-in function implementations
    async getWeather(args) {
        const { location, units = 'celsius' } = args;
        
        // Mock weather API call
        const response = await fetch(`https://api.weather.com/v1/current?location=${encodeURIComponent(location)}&units=${units}`);
        const data = await response.json();
        
        return {
            location: location,
            temperature: data.temperature,
            condition: data.condition,
            humidity: data.humidity,
            units: units
        };
    }
    
    calculateTip(args) {
        const { bill_amount, tip_percentage = 18 } = args;
        const tip = (bill_amount * tip_percentage) / 100;
        const total = bill_amount + tip;
        
        return {
            bill_amount: bill_amount,
            tip_percentage: tip_percentage,
            tip_amount: tip.toFixed(2),
            total_amount: total.toFixed(2)
        };
    }
    
    getCurrentTime(args) {
        const { timezone = 'UTC' } = args;
        const now = new Date();
        
        return {
            timestamp: now.toISOString(),
            timezone: timezone,
            formatted: now.toLocaleString('en-US', { timeZone: timezone })
        };
    }
    
    async searchWeb(args) {
        const { query, max_results = 5 } = args;
        
        // Mock web search
        const response = await fetch(`https://api.search.com/v1/search?q=${encodeURIComponent(query)}&limit=${max_results}`);
        const data = await response.json();
        
        return {
            query: query,
            results: data.results.map(r => ({
                title: r.title,
                url: r.url,
                snippet: r.snippet
            }))
        };
    }
    
    async sendEmail(args) {
        const { to, subject, body } = args;
        
        // Mock email sending
        const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to, subject, body })
        });
        
        return {
            success: response.ok,
            message_id: response.ok ? 'msg_123456' : null,
            error: response.ok ? null : 'Failed to send email'
        };
    }
}

// Usage
const functionRegistry = new FunctionRegistry();

async function executeFunction(name, args) {
    return await functionRegistry.execute(name, args);
}
```

## Advanced Function Patterns

### Multi-Step Function Calls
```javascript
class WorkflowManager {
    constructor(functionRegistry) {
        this.registry = functionRegistry;
        this.workflows = new Map();
    }
    
    async executeWorkflow(workflowName, params) {
        const workflow = this.workflows.get(workflowName);
        if (!workflow) {
            throw new Error(`Workflow '${workflowName}' not found`);
        }
        
        let context = { ...params };
        
        for (const step of workflow.steps) {
            const result = await this.registry.execute(step.function, {
                ...step.args,
                ...context
            });
            
            context = { ...context, ...result };
        }
        
        return context;
    }
    
    defineWorkflow(name, definition) {
        this.workflows.set(name, definition);
    }
}

// Define a complex workflow
const workflowManager = new WorkflowManager(functionRegistry);

workflowManager.defineWorkflow('plan_trip', {
    steps: [
        {
            function: 'get_weather',
            args: { location: '{{destination}}' }
        },
        {
            function: 'search_flights',
            args: { 
                from: '{{origin}}',
                to: '{{destination}}',
                date: '{{travel_date}}'
            }
        },
        {
            function: 'find_hotels',
            args: {
                location: '{{destination}}',
                checkin: '{{travel_date}}',
                nights: '{{duration}}'
            }
        }
    ]
});
```

### Function Call with Validation
```javascript
class ValidatedFunction {
    constructor(name, schema, handler) {
        this.name = name;
        this.schema = schema;
        this.handler = handler;
    }
    
    validate(args) {
        const errors = [];
        
        // Check required fields
        for (const field of this.schema.required || []) {
            if (!(field in args)) {
                errors.push(`Missing required field: ${field}`);
            }
        }
        
        // Validate field types and constraints
        for (const [field, value] of Object.entries(args)) {
            const fieldSchema = this.schema.properties[field];
            if (!fieldSchema) continue;
            
            if (fieldSchema.type === 'number' && typeof value !== 'number') {
                errors.push(`Field '${field}' must be a number`);
            }
            
            if (fieldSchema.enum && !fieldSchema.enum.includes(value)) {
                errors.push(`Field '${field}' must be one of: ${fieldSchema.enum.join(', ')}`);
            }
            
            if (fieldSchema.minimum && value < fieldSchema.minimum) {
                errors.push(`Field '${field}' must be at least ${fieldSchema.minimum}`);
            }
            
            if (fieldSchema.maximum && value > fieldSchema.maximum) {
                errors.push(`Field '${field}' must be at most ${fieldSchema.maximum}`);
            }
        }
        
        return errors;
    }
    
    async execute(args) {
        const errors = this.validate(args);
        if (errors.length > 0) {
            throw new Error(`Validation failed: ${errors.join(', ')}`);
        }
        
        return await this.handler(args);
    }
}

// Create validated function
const transferMoney = new ValidatedFunction(
    'transfer_money',
    {
        properties: {
            from_account: { type: 'string', minLength: 10 },
            to_account: { type: 'string', minLength: 10 },
            amount: { type: 'number', minimum: 0.01, maximum: 10000 },
            currency: { type: 'string', enum: ['USD', 'EUR', 'GBP'] }
        },
        required: ['from_account', 'to_account', 'amount']
    },
    async (args) => {
        // Secure money transfer implementation
        return {
            transaction_id: 'txn_' + Date.now(),
            status: 'completed',
            amount: args.amount,
            currency: args.currency || 'USD'
        };
    }
);
```

### Conditional Function Execution
```javascript
class ConditionalFunction {
    constructor(name, conditions, trueHandler, falseHandler) {
        this.name = name;
        this.conditions = conditions;
        this.trueHandler = trueHandler;
        this.falseHandler = falseHandler;
    }
    
    evaluateConditions(args, context) {
        return this.conditions.every(condition => {
            switch (condition.type) {
                case 'equals':
                    return args[condition.field] === condition.value;
                case 'greater_than':
                    return args[condition.field] > condition.value;
                case 'in_range':
                    return args[condition.field] >= condition.min && 
                           args[condition.field] <= condition.max;
                case 'user_permission':
                    return context.user?.permissions?.includes(condition.permission);
                default:
                    return false;
            }
        });
    }
    
    async execute(args, context = {}) {
        if (this.evaluateConditions(args, context)) {
            return await this.trueHandler(args, context);
        } else {
            return await this.falseHandler(args, context);
        }
    }
}

// Example: Conditional database access
const conditionalQuery = new ConditionalFunction(
    'query_database',
    [
        { type: 'user_permission', permission: 'database_read' },
        { type: 'in_range', field: 'limit', min: 1, max: 100 }
    ],
    async (args, context) => {
        // Authorized database query
        return await database.query(args.query, { limit: args.limit });
    },
    async (args, context) => {
        // Unauthorized or invalid request
        return {
            error: 'Access denied or invalid parameters',
            message: 'Please check your permissions and query parameters'
        };
    }
);
```

## Security Best Practices

### Input Sanitization
```javascript
class SecureFunction {
    static sanitizeString(input, maxLength = 1000) {
        if (typeof input !== 'string') {
            throw new Error('Input must be a string');
        }
        
        // Remove potentially dangerous characters
        const sanitized = input
            .replace(/[<>'"&]/g, '') // Remove HTML/XML characters
            .replace(/[;|&`]/g, '')  // Remove shell injection characters
            .slice(0, maxLength);    // Limit length
        
        return sanitized.trim();
    }
    
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    static validateUrl(url) {
        try {
            const parsed = new URL(url);
            return ['http:', 'https:'].includes(parsed.protocol);
        } catch {
            return false;
        }
    }
}

// Secure function implementation
async function secureFileOperation(args) {
    const { filename, operation } = args;
    
    // Sanitize filename
    const safeFilename = SecureFunction.sanitizeString(filename)
        .replace(/[\/\\:*?"<>|]/g, '') // Remove path characters
        .replace(/\.\./g, '');         // Prevent directory traversal
    
    if (!safeFilename) {
        throw new Error('Invalid filename');
    }
    
    // Validate operation
    const allowedOperations = ['read', 'list', 'info'];
    if (!allowedOperations.includes(operation)) {
        throw new Error('Operation not allowed');
    }
    
    // Execute safely
    return await fileSystem[operation](safeFilename);
}
```

### Rate Limiting
```javascript
class RateLimitedFunction {
    constructor(name, handler, maxCalls = 10, windowMs = 60000) {
        this.name = name;
        this.handler = handler;
        this.maxCalls = maxCalls;
        this.windowMs = windowMs;
        this.calls = new Map();
    }
    
    checkRateLimit(userId) {
        const now = Date.now();
        const userCalls = this.calls.get(userId) || [];
        
        // Remove old calls outside the window
        const recentCalls = userCalls.filter(time => now - time < this.windowMs);
        this.calls.set(userId, recentCalls);
        
        if (recentCalls.length >= this.maxCalls) {
            throw new Error(`Rate limit exceeded. Max ${this.maxCalls} calls per ${this.windowMs / 1000} seconds`);
        }
        
        // Record this call
        recentCalls.push(now);
    }
    
    async execute(args, context) {
        const userId = context.user?.id || 'anonymous';
        this.checkRateLimit(userId);
        
        return await this.handler(args, context);
    }
}
```

### Permission System
```javascript
class PermissionManager {
    constructor() {
        this.permissions = new Map();
        this.userRoles = new Map();
        this.rolePermissions = new Map();
    }
    
    defineRole(roleName, permissions) {
        this.rolePermissions.set(roleName, new Set(permissions));
    }
    
    assignRole(userId, roleName) {
        if (!this.userRoles.has(userId)) {
            this.userRoles.set(userId, new Set());
        }
        this.userRoles.get(userId).add(roleName);
    }
    
    hasPermission(userId, permission) {
        const userRoles = this.userRoles.get(userId) || new Set();
        
        for (const role of userRoles) {
            const rolePerms = this.rolePermissions.get(role) || new Set();
            if (rolePerms.has(permission)) {
                return true;
            }
        }
        
        return false;
    }
    
    requirePermission(permission) {
        return (args, context) => {
            const userId = context.user?.id;
            if (!userId || !this.hasPermission(userId, permission)) {
                throw new Error(`Permission denied: ${permission} required`);
            }
        };
    }
}

// Setup permissions
const permissionManager = new PermissionManager();

permissionManager.defineRole('admin', ['database_read', 'database_write', 'send_email', 'file_access']);
permissionManager.defineRole('user', ['database_read', 'send_email']);
permissionManager.defineRole('guest', []);

permissionManager.assignRole('user123', 'user');
permissionManager.assignRole('admin456', 'admin');
```

## Complete Integration Example

```javascript
class RealtimeFunctionManager {
    constructor(dataChannel) {
        this.dataChannel = dataChannel;
        this.functionRegistry = new FunctionRegistry();
        this.permissionManager = new PermissionManager();
        this.setupEventHandlers();
    }
    
    setupEventHandlers() {
        // Listen for function calls
        this.dataChannel.addEventListener('message', (event) => {
            const data = JSON.parse(event.data);
            this.handleServerEvent(data);
        });
    }
    
    async handleServerEvent(event) {
        if (event.type === 'response.done') {
            const output = event.response.output[0];
            
            if (output.type === 'function_call') {
                await this.executeFunctionCall(output);
            }
        }
    }
    
    async executeFunctionCall(functionCall) {
        const { name, call_id, arguments: args } = functionCall;
        
        try {
            // Parse arguments
            const parsedArgs = JSON.parse(args);
            
            // Get user context (implement based on your auth system)
            const context = await this.getUserContext();
            
            // Execute function with security checks
            const result = await this.functionRegistry.execute(name, parsedArgs, context);
            
            // Send successful result
            await this.sendFunctionResult(call_id, result);
            
        } catch (error) {
            console.error(`Function ${name} failed:`, error);
            
            // Send error result
            await this.sendFunctionResult(call_id, {
                error: error.message,
                success: false
            });
        }
        
        // Generate response with function results
        this.createResponse();
    }
    
    async sendFunctionResult(callId, result) {
        const resultEvent = {
            type: "conversation.item.create",
            item: {
                type: "function_call_output",
                call_id: callId,
                output: JSON.stringify(result)
            }
        };
        
        this.dataChannel.send(JSON.stringify(resultEvent));
    }
    
    createResponse() {
        this.dataChannel.send(JSON.stringify({
            type: "response.create"
        }));
    }
    
    async getUserContext() {
        // Implement your user authentication/context logic
        return {
            user: {
                id: 'user123',
                permissions: ['database_read', 'send_email']
            }
        };
    }
    
    // Register new functions
    registerFunction(name, schema, handler) {
        this.functionRegistry.register(name, new ValidatedFunction(name, schema, handler));
    }
    
    // Update session with available functions
    updateSessionFunctions() {
        const tools = Array.from(this.functionRegistry.functions.entries()).map(([name, func]) => ({
            type: "function",
            name: name,
            description: func.schema.description || `Execute ${name} function`,
            parameters: func.schema
        }));
        
        const sessionUpdate = {
            type: "session.update",
            session: {
                tools: tools,
                tool_choice: "auto"
            }
        };
        
        this.dataChannel.send(JSON.stringify(sessionUpdate));
    }
}

// Usage
const functionManager = new RealtimeFunctionManager(dataChannel);

// Register custom functions
functionManager.registerFunction('calculate_tax', {
    properties: {
        amount: { type: 'number', minimum: 0 },
        rate: { type: 'number', minimum: 0, maximum: 1 }
    },
    required: ['amount', 'rate']
}, (args) => {
    return {
        amount: args.amount,
        tax_rate: args.rate,
        tax_amount: args.amount * args.rate,
        total: args.amount * (1 + args.rate)
    };
});

// Update session with all available functions
functionManager.updateSessionFunctions();
```

Function calling transforms Realtime API from a conversational interface into a powerful platform for building AI agents that can interact with external systems and perform complex tasks. Always prioritize security, validation, and user permissions when implementing function calls.
