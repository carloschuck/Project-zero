# File Upload Architecture

## Before the Fix

```
┌─────────────────────────────────────────────────────────┐
│                    DigitalOcean App                     │
│  ┌────────────────────────────────────────────────┐   │
│  │              Backend Container                 │   │
│  │  ┌──────────┐         ┌──────────────────┐   │   │
│  │  │          │ Upload  │                  │   │   │
│  │  │  Multer  │────────▶│  Memory Storage  │   │   │
│  │  │          │         │  (Ephemeral!)    │   │   │
│  │  └──────────┘         └──────────────────┘   │   │
│  │                              │                 │   │
│  │                              │ Save path:      │   │
│  │                              │ "memory-storage"│   │
│  │                              ▼                 │   │
│  │                       ┌──────────┐            │   │
│  │                       │          │            │   │
│  │                       │ Database │            │   │
│  │                       │          │            │   │
│  │                       └──────────┘            │   │
│  └────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘

❌ Problem:
- Files stored in container's memory/disk
- Container restarts = files lost
- Downloads fail (path doesn't exist)
```

## After the Fix

```
┌──────────────────────────────────────────────────────────────────────┐
│                         DigitalOcean                                 │
│                                                                      │
│  ┌────────────────────────────────────┐    ┌──────────────────┐   │
│  │       Backend Container            │    │                  │   │
│  │  ┌──────────┐                      │    │  DigitalOcean    │   │
│  │  │          │ Upload                │    │     Spaces       │   │
│  │  │  Multer  │──────────────────────┼───▶│                  │   │
│  │  │          │  to Spaces            │    │  ┌────────────┐ │   │
│  │  └──────────┘                      │    │  │ projects/  │ │   │
│  │       │                             │    │  │ tickets/   │ │   │
│  │       │ Save path:                  │    │  └────────────┘ │   │
│  │       │ "projects/file123.pdf"      │    │                  │   │
│  │       ▼                             │    │  ✅ Persistent   │   │
│  │  ┌──────────┐                      │    │  ✅ Scalable     │   │
│  │  │          │                      │    │  ✅ S3-compat    │   │
│  │  │ Database │                      │    │                  │   │
│  │  │          │                      │    └──────────────────┘   │
│  │  └──────────┘                      │                           │
│  │                                     │                           │
│  │  Download:                          │                           │
│  │  ┌──────────┐                      │                           │
│  │  │          │ Get from              │                           │
│  │  │  Stream  │◀─────────────────────┼───────────────────────────┤
│  │  │          │  Spaces               │                           │
│  │  └──────────┘                      │                           │
│  └────────────────────────────────────┘                           │
└──────────────────────────────────────────────────────────────────────┘

✅ Solution:
- Files persist in Spaces (object storage)
- Container restarts = files remain
- Downloads work (stream from Spaces)
- Scalable for any file volume
```

## Upload Flow Diagram

```
┌─────────┐
│  User   │
│ Browser │
└────┬────┘
     │ POST /api/projects/:id/attachments
     │ FormData: file
     ▼
┌──────────────────────────────────┐
│  Backend API                     │
│  (attachmentController.js)       │
│                                  │
│  1. authenticateToken()          │
│  2. multer.single('file')        │◀─── Memory Storage
│  3. Check permissions            │
│  4. isSpacesConfigured?          │
│     │                            │
│     ├─YES─▶ Upload to Spaces     │
│     │       (S3 PutObject)       │───┐
│     │                            │   │
│     └─NO──▶ Save to local disk   │   │
│             (fallback)           │   │
│                                  │   │
│  5. Save metadata to DB          │◀──┘
│     - filename                   │
│     - file_path (Spaces key)     │
│     - file_size                  │
│     - mime_type                  │
│                                  │
│  6. Return success ✅            │
└──────────────────────────────────┘
     │
     ▼
┌─────────┐
│Database │
│(PostgreSQL)
└─────────┘

┌─────────────────┐
│DigitalOcean     │
│Spaces           │
│                 │
│ projects/       │
│   file123.pdf   │
│ tickets/        │
│   file456.jpg   │
└─────────────────┘
```

## Download Flow Diagram

```
┌─────────┐
│  User   │
│ Browser │
└────┬────┘
     │ GET /api/attachments/:id/download
     ▼
┌──────────────────────────────────┐
│  Backend API                     │
│  (attachmentController.js)       │
│                                  │
│  1. authenticateToken()          │
│  2. Get attachment from DB       │
│     - id                         │
│     - file_path                  │
│     - mime_type                  │
│  3. Check permissions            │
│  4. isSpacesConfigured?          │
│     │                            │
│     ├─YES─▶ Stream from Spaces   │
│     │       (S3 GetObject)       │───┐
│     │       Set headers          │   │
│     │       Pipe to response     │   │
│     │                            │   │
│     └─NO──▶ Stream from disk     │   │
│             (fs.createReadStream)│   │
│                                  │   │
│  5. Send file ✅                 │◀──┘
└──────────────────────────────────┘
     │
     ▼
┌─────────┐
│  User   │
│ Browser │
│ (file   │
│download)│
└─────────┘

┌─────────────────┐
│DigitalOcean     │
│Spaces           │
│                 │
│ Stream file     │
│ directly to     │
│ user            │
└─────────────────┘
```

## Environment Detection

```
┌────────────────────────────────────────┐
│  Backend Startup                       │
│  (src/config/spaces.js)                │
│                                        │
│  Check environment variables:          │
│  - SPACES_ENDPOINT                     │
│  - SPACES_KEY                          │
│  - SPACES_SECRET                       │
│  - SPACES_BUCKET                       │
│                                        │
│  All present?                          │
│  ├─YES─▶ Configure S3 Client           │
│  │       Export: isSpacesConfigured=true│
│  │       Log: ✅ Spaces configured     │
│  │                                      │
│  └─NO──▶ Export: isSpacesConfigured=false│
│          Log: 💻 Local storage         │
│          (Development mode)            │
└────────────────────────────────────────┘
```

## Data Flow Comparison

### Before (Broken)
```
Upload:  Browser → Multer → Memory → DB (path: "memory-storage")
                                    Files lost on restart! ❌

Download: Browser → Controller → Check path "memory-storage"
                                → fs.existsSync() = false ❌
                                → Error: File not found ❌
```

### After (Fixed)
```
Upload:  Browser → Multer → Memory → Spaces → DB (path: "projects/file123.pdf")
                                              Files persist! ✅

Download: Browser → Controller → Query DB → Get Spaces path
                                → S3 GetObject → Stream to user ✅
                                → Success! ✅
```

## File Organization in Spaces

```
ticketing-system-uploads/
│
├── projects/                    ← All project attachments
│   ├── proposal-1234567890.pdf
│   ├── budget-1234567891.xlsx
│   └── design-1234567892.png
│
└── tickets/                     ← All ticket attachments
    ├── screenshot-1234567893.jpg
    ├── error-log-1234567894.txt
    └── report-1234567895.docx
```

## Security Architecture

```
┌─────────┐
│  User   │
└────┬────┘
     │
     │ Must be authenticated
     ▼
┌────────────────────────────────┐
│  Backend API                   │
│  - JWT Token validation ✅     │
│  - Role checking ✅            │
│  - Permission verification ✅  │
└────────┬───────────────────────┘
         │
         │ Private API call
         ▼
┌────────────────────────────────┐
│  DigitalOcean Spaces           │
│  - Private bucket ✅           │
│  - No public access ✅         │
│  - Requires API keys ✅        │
│  - Keys stored as secrets ✅   │
└────────────────────────────────┘

✅ Files are NOT publicly accessible
✅ All downloads require authentication
✅ API keys stored encrypted in DigitalOcean
```

## Cost Structure

```
DigitalOcean Spaces: $5/month base
│
├─ Included:
│  ├─ 250 GB storage
│  └─ 1 TB outbound transfer
│
└─ Additional costs:
   ├─ Storage: $0.02/GB/month (over 250GB)
   └─ Transfer: $0.01/GB (over 1TB)

Example Scenarios:
├─ Small (5GB, 100GB transfer): $5/month
├─ Medium (100GB, 500GB transfer): $5/month
└─ Large (1TB, 5TB transfer): $20/month
    └─ Storage: $5 + ($750GB × $0.02) = $20
        Transfer: $5 included + (4TB × $0.01/GB) = +$40
        Total: $60/month
```

## Deployment Environments

### Local Development
```
┌─────────────────┐
│  Developer      │
│  Machine        │
│                 │
│  ✓ PostgreSQL   │
│  ✓ Node.js      │
│  ✓ Local disk   │
│                 │
│  No Spaces      │
│  needed! ✅     │
└─────────────────┘
```

### Production (DigitalOcean)
```
┌─────────────────────────────────────┐
│  DigitalOcean                       │
│                                     │
│  ┌────────────┐  ┌───────────────┐│
│  │ App        │  │ PostgreSQL    ││
│  │ Platform   │  │ Managed DB    ││
│  └────────────┘  └───────────────┘│
│                                     │
│  ┌─────────────────────────────────┤
│  │ Spaces (Object Storage)         │
│  │ - Persistent ✅                 │
│  │ - Scalable ✅                   │
│  │ - Required ✅                   │
│  └─────────────────────────────────┤
└─────────────────────────────────────┘
```

## Migration Path

### Existing Files (Before Fix)
```
Database:
- file_path: "memory-storage"
- Status: ❌ Cannot download

Action: Re-upload files
```

### New Files (After Fix)
```
Database:
- file_path: "projects/file123.pdf"
- Status: ✅ Can download

Storage: DigitalOcean Spaces
```

## Technology Stack

```
┌──────────────────────────────────────┐
│  Frontend (React)                    │
│  - FormData upload                   │
│  - Blob download                     │
└────────┬─────────────────────────────┘
         │
         │ HTTP/S
         ▼
┌──────────────────────────────────────┐
│  Backend (Node.js/Express)           │
│  - Multer (multipart parsing)        │
│  - AWS SDK (@aws-sdk/client-s3)      │
│  - Express validators                │
└────┬─────────────────────┬───────────┘
     │                     │
     │                     │
     ▼                     ▼
┌────────────┐      ┌──────────────────┐
│PostgreSQL  │      │DigitalOcean      │
│- Metadata  │      │Spaces            │
│- Paths     │      │- S3 compatible   │
│- Sizes     │      │- Actual files    │
└────────────┘      └──────────────────┘
```

## Summary

**Before**: Ephemeral storage → Files lost → Downloads fail ❌

**After**: Persistent Spaces → Files saved → Downloads work ✅

**Cost**: $5/month (very reasonable)

**Setup**: 5 minutes

**Impact**: High (critical feature now works!)

