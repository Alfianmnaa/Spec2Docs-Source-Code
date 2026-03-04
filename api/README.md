# Spec2Docs API - Backend Documentation

## Overview

Spec2Docs is an intelligent API documentation generator that automatically converts Express.js source code into comprehensive OpenAPI 3.0.3 specifications with AI-powered enhancements.

## Key Features

### 🔍 **Intelligent Parsing**

- Advanced AST-based Express.js route detection
- Supports all HTTP methods (GET, POST, PUT, DELETE, PATCH)
- Automatic parameter extraction (path, query, body)
- Middleware detection for authentication
- Recursive folder scanning

### 🤖 **AI Enhancement**

- Powered by Google Gemini 2.5 Flash (with 1.5 fallback)
- Automatic description generation
- Professional narrative creation
- Request/response example generation
- Retry mechanism with exponential backoff

### 📊 **Quality Scoring**

- Comprehensive quality analysis (0-100 score)
- 7 evaluation criteria:
  - Basic Info (15 points)
  - Endpoints Completeness (20 points)
  - Descriptions Quality (25 points)
  - Examples Quality (15 points)
  - Schemas Quality (10 points)
  - Error Handling (10 points)
  - Security (5 points)
- Actionable improvement suggestions
- Quality grade (A+ to F)

### 📤 **Export Formats**

- **JSON**: OpenAPI 3.0.3 JSON format
- **YAML**: OpenAPI 3.0.3 YAML format
- **Markdown**: Beautiful MD documentation
- **HTML**: Styled HTML documentation

## Architecture

```
api/
├── src/
│   ├── api/
│   │   ├── controllers/     # Request handlers
│   │   ├── middlewares/     # Express middlewares
│   │   └── routes/          # API routes
│   ├── config/              # Configuration files
│   ├── core/                # Core business logic
│   │   ├── parser.js        # AST-based Express parser
│   │   ├── mapper.js        # OpenAPI mapper
│   │   └── aiService.js     # AI enhancement service
│   ├── models/              # Mongoose models
│   └── utils/               # Utility functions
├── uploads/                 # Temporary file storage
└── server.js               # Application entry point
```

## API Endpoints

### Authentication

```
POST   /api/auth/register    # Register new user
POST   /api/auth/login       # User login
```

### Documentation

```
POST   /api/docs/generate              # Generate documentation from ZIP
GET    /api/docs                       # Get all user's documentations
GET    /api/docs/:id                   # Get specific documentation
DELETE /api/docs/:id                   # Delete documentation
GET    /api/docs/export/:id/:format    # Export (json/yaml/markdown/html)
```

## Flow Process

### 1. Upload & Extraction

```javascript
User uploads ZIP → Multer validates → Extract to temp folder
```

### 2. Discovery & Parsing

```javascript
Scan folder recursively → Find .js/.ts files → AST parsing → Extract endpoints
```

### 3. Mapping to OpenAPI

```javascript
Endpoints array → Map to OpenAPI 3.0.3 → Add parameters, schemas, responses
```

### 4. AI Enhancement (Optional)

```javascript
Basic spec → Google Gemini 2.5 → Enhanced descriptions → Fallback to 1.5 if needed
```

### 5. Quality Scoring

```javascript
Analyze spec → Calculate scores → Generate suggestions → Assign grade
```

### 6. Save & Export

```javascript
Save to MongoDB → Available for export → Multiple formats
```

## Environment Variables

Create `.env` file:

```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/spec2docs

# Authentication
JWT_SECRET=your_jwt_secret_key_here

# AI Service
GEMINI_API_KEY=your_google_gemini_api_key
```

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start
```

## Dependencies

### Core

- **express**: Web framework
- **mongoose**: MongoDB ODM
- **jsonwebtoken**: JWT authentication
- **bcryptjs**: Password hashing

### Parsing & Processing

- **acorn**: JavaScript AST parser
- **acorn-walk**: AST traversal
- **adm-zip**: ZIP file handling

### AI & Export

- **@google/generative-ai**: Gemini AI integration
- **yaml**: YAML serialization

### File Handling

- **multer**: File upload middleware
- **fs-extra**: Enhanced file system operations

## Parser Capabilities

### Supported Patterns

```javascript
// Basic routes
app.get('/users', handler)
router.post('/users', handler)

// Path parameters
app.get('/users/:id', handler)

// Multiple middlewares
router.post('/users', auth, validate, handler)

// Request body detection
router.post('/users', (req, res) => {
  const data = req.body; // Detected!
})

// Response status detection
router.get('/users', (req, res) => {
  res.status(200).json(...) // Status captured!
})
```

### Detection Features

- ✅ All HTTP methods
- ✅ Path parameters (`:id` → `{id}`)
- ✅ Middleware chains
- ✅ Request body usage
- ✅ Response status codes
- ✅ Authentication middleware
- ✅ Template literals in paths

## Quality Scoring Breakdown

| Criteria       | Max Points | Evaluates                                     |
| -------------- | ---------- | --------------------------------------------- |
| Basic Info     | 15         | Title, description, version, contact, license |
| Endpoints      | 20         | Existence, count, parameters, request bodies  |
| Descriptions   | 25         | Quality and completeness of descriptions      |
| Examples       | 15         | Request/response examples                     |
| Schemas        | 10         | Reusable component schemas                    |
| Error Handling | 10         | Error response documentation                  |
| Security       | 5          | Security schemes definition                   |

## Error Handling

### Comprehensive Error Types

- ✅ Validation errors (400)
- ✅ Authentication errors (401)
- ✅ Authorization errors (403)
- ✅ Not found errors (404)
- ✅ Duplicate key errors (400)
- ✅ Cast errors (404)
- ✅ JWT errors (401)
- ✅ Multer file upload errors (400)
- ✅ Internal server errors (500)

### Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "stack": "..." // Only in development
}
```

## Best Practices Implemented

### Security

- ✅ JWT authentication on all protected routes
- ✅ Password hashing with bcrypt
- ✅ File type validation (ZIP only)
- ✅ File size limits (50MB max)
- ✅ User ownership checks

### Performance

- ✅ Recursive folder scanning with error handling
- ✅ Efficient AST parsing
- ✅ AI retry mechanism with exponential backoff
- ✅ Timeout controls (25 seconds)
- ✅ Automatic cleanup of temp files

### Data Integrity

- ✅ Schema validation with Mongoose
- ✅ OpenAPI 3.0.3 compliance
- ✅ Transaction safety
- ✅ Fallback mechanisms

### Code Quality

- ✅ Modular architecture
- ✅ Separation of concerns
- ✅ Comprehensive error handling
- ✅ Detailed logging
- ✅ Code documentation

## Testing

### Test ZIP Structure

```
project.zip
├── routes/
│   ├── users.js
│   └── auth.js
├── controllers/
│   └── userController.js
└── app.js
```

### Sample Request

```bash
curl -X POST http://localhost:5000/api/docs/generate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@project.zip" \
  -F "projectName=My API" \
  -F "useAI=true"
```

### Sample Response

```json
{
  "success": true,
  "message": "Dokumentasi berhasil dibuat",
  "data": {
    "id": "...",
    "projectName": "My API",
    "endpointCount": 12,
    "qualityScore": 87,
    "qualityGrade": "A-",
    "aiEnhanced": true,
    "spec": { ... },
    "qualityMetrics": { ... }
  }
}
```

## Troubleshooting

### Common Issues

**1. AI Enhancement Timeout**

- Solution: Increase timeout in `aiService.js` or disable AI enhancement

**2. ZIP Extraction Fails**

- Solution: Check ZIP file structure and permissions

**3. No Endpoints Found**

- Solution: Ensure files contain Express route definitions

**4. MongoDB Connection Error**

- Solution: Verify MONGODB_URI in .env

## Future Enhancements

- [ ] Support for FastAPI, Flask, Django
- [ ] Real-time parsing progress updates
- [ ] Custom template support
- [ ] Batch processing
- [ ] API versioning detection
- [ ] GraphQL schema generation

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:

- Create an issue on GitHub
- Email: support@spec2docs.dev

---

**Built with ❤️ using Express.js, MongoDB, and Google Gemini AI**
