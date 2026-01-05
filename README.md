# job-queue-system

Documentation Link : https://suryanshsahu1801.notion.site/Simple-Job-Queue-System-2de9e56e264a807bafd4f61cfac6ce4f

Loom Video : https://www.loom.com/share/d74748cfb0fa41ce8ca37f6e04a4c264

## **Setup & Run Instructions**

### **Prerequisites**

- **Node.js:** Version 20+ (Required for Next.js frontend)
- **Docker Desktop:** (Optional, for containerized run)
- **Git:** To clone the repository

### **Option A: Dockerized Setup (Recommended)**

This is the fastest way to run the entire system (Backend + Frontend) with zero configuration.

**1. Navigate to Project Root**
Ensure you are in the root directory `job-queue-system/` where `docker-compose.yml` is located.

Docker file is commited with the code.

**2. Run Docker Compose :** 

```bash
docker-compose up --build
```

- Docker will automatically build images for both services and start them.
- **Frontend Dashboard**
- **Backend API**

---

### **Option B: Standard Local Setup (Manual)**

**1. Clone the Repository :** 

```bash
git clone https://github.com/suryansh1801/job-queue-system.git
```

**2. Setup Backend**

- The backend will start on `http://localhost:8000`.

**3. Setup Frontend**
Open a **new** terminal window.

- The frontend will start on `http://localhost:3000`.

### Postman APIs
**Post Jobs**
```bash
curl --location 'http://localhost:8000/api/jobs' \
--header 'Content-Type: application/json' \
--data-raw '{
    "type": "io_wait",
    "payload": {
        "to": "example@email.com",
        "body": "Random text",
        "shouldFail": false 
    }
}'
```

**Get Jobs**
```bash
curl --location 'http://localhost:8000/api/jobs/' \
--header 'Content-Type: application/json' \
--data ''
```
