# E-Library Setup & Run Process (Windows + XAMPP)

This guide walks you through setting up and running the **Textora E-Library** on Windows using **XAMPP**.

---

## Prerequisites

- **Windows 10/11**
- **XAMPP** (download from [https://www.apachefriends.org/](https://www.apachefriends.org/))
- **Git** (optional, for cloning the project)
- **Any text editor or IDE** (VS Code recommended)

---

## Step 1: Install XAMPP

1. Download XAMPP from https://www.apachefriends.org/
2. Run the installer and follow the default prompts
3. Choose installation folder (default: `C:\xampp`)
4. During setup, select:
   - Apache ✓
   - MySQL ✓
   - PHP ✓
   - phpMyAdmin ✓

5. Click **Finish** and start XAMPP Control Panel

---

## Step 2: Start XAMPP Services

1. Open **XAMPP Control Panel** (from Windows Start menu or `C:\xampp\xampp-control.exe`)
2. Start the following services by clicking their **Start** buttons:
   - **Apache**
   - **MySQL**

3. Verify both show **green** status

**Expected:**
```
Apache: Running (with green icon)
MySQL:  Running (with green icon)
```

---

## Step 3: Place Project in htdocs

1. Clone or download this e-library project
2. Place the entire project folder in:
   ```
   C:\xampp\htdocs\
   ```

**Example path after placement:**
```
C:\xampp\htdocs\e-library\
├── README.md
├── PROCESS.md
├── backend/
├── frontend/
├── js/
└── ...
```

---

## Step 4: Create & Setup the Database

### 4.1 Access phpMyAdmin

1. Open your browser and go to:
   ```
   http://localhost/phpmyadmin
   ```

2. You should see the phpMyAdmin dashboard
   - Default username: `root`
   - Default password: (leave blank) or `pmauser` with password `password123`

### 4.2 Create Database

1. Click **New** on the left sidebar
2. Type database name: `textora_db`
3. Encoding: Select `utf8mb4_unicode_ci`
4. Click **Create**

### 4.3 Create Tables

1. Click on the newly created `textora_db` database
2. Click the **SQL** tab
3. Copy and paste this SQL script:

```sql
-- Users Table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('student', 'teacher', 'reader', 'admin') DEFAULT 'student',
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions Table
CREATE TABLE sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Books Table
CREATE TABLE books (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    isbn VARCHAR(20) UNIQUE,
    description TEXT,
    category VARCHAR(100),
    cover_url VARCHAR(500),
    file_url VARCHAR(500) UNIQUE NOT NULL,
    status ENUM('available', 'pending') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Reviews Table
CREATE TABLE reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

-- Transactions (Reading History)
CREATE TABLE transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    progress INT DEFAULT 0,
    status ENUM('reading', 'completed') DEFAULT 'reading',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finished_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

-- Book Requests Table
CREATE TABLE requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    book_title VARCHAR(255) NOT NULL,
    author_name VARCHAR(255),
    isbn VARCHAR(20),
    reason TEXT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    admin_comment TEXT,
    reviewed_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);
```

4. Click **Go** to execute the SQL

**Expected:** Green success message

---

## Step 5: Configure Backend

### 5.1 Update Database Credentials

1. Open: `C:\xampp\htdocs\e-library\backend\config\database.php`
2. Verify these settings match your XAMPP setup:

```php
private static string $host   = 'localhost';
private static string $dbName = 'textora_db';
private static string $user   = 'root';          // XAMPP default user
private static string $pass   = '';              // XAMPP default (empty)
private static string $charset = 'utf8mb4';
```

> **For phpMyAdmin login:** If your phpMyAdmin has different credentials, update `$user` and `$pass` accordingly.

### 5.2 Verify API Base URL

1. Open: `C:\xampp\htdocs\e-library\frontend\index.html`
2. Look for line ~267:

```javascript
window.TEXTORA_API_BASE_URL = 'http://127.0.0.1:8000';
```

**For XAMPP, change to:**
```javascript
window.TEXTORA_API_BASE_URL = 'http://localhost/e-library/backend/public';
```

Save the file.

---

## Step 6: Test Backend API

### 6.1 Open Command Prompt/PowerShell

1. Press `Win + R`
2. Type `cmd` and press Enter
3. Navigate to project folder:

```cmd
cd C:\xampp\htdocs\e-library
```

### 6.2 Start PHP Built-in Server (Optional but Easier)

Since XAMPP's Apache can be finicky, you can use PHP's built-in server:

```cmd
cd C:\xampp\htdocs\e-library\backend\public
php -S 127.0.0.1:8000
```

You'll see:
```
[date time] PHP 8.0.0 Development Server started at http://127.0.0.1:8000
```

**Keep this terminal open.**

### 6.3 Test Register Endpoint (in another terminal)

1. Open a **new** Command Prompt
2. Run this curl command:

```cmd
curl -X POST http://127.0.0.1:8000/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test User\",\"email\":\"test@textora.com\",\"password\":\"password123\",\"role\":\"student\"}"
```

**Expected response:**
```json
{
  "success": true,
  "message": "Account created successfully.",
  "data": {
    "token": "...",
    "user": { "id": 1, "name": "Test User", "email": "test@textora.com", "role": "Student" }
  }
}
```

---

## Step 7: Open Frontend in Browser

1. Open any browser (Chrome, Firefox, Edge)
2. Go to:
   ```
   http://localhost/e-library/frontend/index.html
   ```

3. You should see the **Textora Login page**

---

## Step 8: Test Login

1. Use the test account created in Step 6.3:
   - **Email:** `test@textora.com`
   - **Password:** `password123`

2. Click **Sign In**

3. If successful, you'll be redirected to the **Dashboard**

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Apache won't start | Check if port 80 is in use. Stop Skype, IIS, or other services. Or change Apache port in XAMPP config. |
| MySQL won't start | Ensure MySQL folder permissions are correct. Or reinstall XAMPP with admin privileges. |
| `Validation failed` on register | Check password is at least 8 characters, email format is valid, name is at least 2 characters. |
| `401 Unauthorized` on login | Ensure the user exists in `textora_db.users` table and credentials are correct. |
| Database connection failed | Verify credentials in `backend/config/database.php` match your MySQL setup in XAMPP. |
| Frontend can't reach API | Ensure `window.TEXTORA_API_BASE_URL` in `frontend/index.html` points to correct backend URL. |

---

## Quick Restart Steps

Whenever you need to restart the project:

1. **Start XAMPP Control Panel** → Start Apache & MySQL
2. **Open terminal** at `backend/public` folder:
   ```cmd
   php -S 127.0.0.1:8000
   ```
3. **Open browser**: `http://localhost/e-library/frontend/index.html`

---

## File Locations Reference

| Component | Path |
|-----------|------|
| **Project Root** | `C:\xampp\htdocs\e-library\` |
| **Backend API** | `C:\xampp\htdocs\e-library\backend\public\index.php` |
| **Frontend HTML** | `C:\xampp\htdocs\e-library\frontend\index.html` |
| **Database Config** | `C:\xampp\htdocs\e-library\backend\config\database.php` |
| **XAMPP htdocs** | `C:\xampp\htdocs\` |
| **phpMyAdmin** | `http://localhost/phpmyadmin` |

---

## Next Steps

- Add more test users via `/auth/register` API or SQL
- Upload books to `backend/public/uploads/books/`
- Customize CSS in `frontend/css/`
- Add more features to backend controllers

Good luck! 🚀

