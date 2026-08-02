# Get Online | Premium Tech & Lifestyle Accessories Store

Get Online is a high-performance, responsive e-commerce application built on Next.js 16 (App Router), styled with Vanilla CSS, and backed by a MongoDB database cluster. It features an administrative control panel, a secure dynamic shopping cart, discount coupon codes validation, automated email notifications, and real-time customer package tracking.

---

## Technical Stack
* **Framework**: Next.js 16 (Turbopack)
* **Styling**: Vanilla CSS (Tailwind variables integration)
* **Database**: MongoDB Atlas via Mongoose ORM
* **State Management**: Zustand (Cart persistence)
* **Authentication**: JWT token cookies verification (Jose encryption)
* **File Uploads**: Cloudinary API (Local uploads fallback)
* **Notifications**: Nodemailer (SMTP transport)

---

## Getting Started Locally

### 1. Prerequisites
Ensure you have **Node.js v18.x** or higher installed.

### 2. Install Dependencies
Clone the repository and run:
```bash
npm install
```

### 3. Environment Configurations
Create a `.env.local` file in the project root and populate it with the required keys (refer to `.env.example`):
```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/Ecommerce?retryWrites=true&w=majority
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_APP_PASSWORD=your_gmail_app_specific_password
ORDER_NOTIFICATION_EMAIL=rehanmuhammad546@gmail.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_EMAIL=rehanmuhammad546@gmail.com
ADMIN_PASSWORD_HASH=your_admin_hashed_password
```

### 4. Database Seeding & Admin Account Creation
Run the database seed script to clear previous collections and populate categories, mock products, coupons, and create the default admin account:
```bash
npx tsx src/scripts/seed.ts
```
**Default Admin Credentials**:
* **Email**: `rehanmuhammad546@gmail.com`
* **Password**: `admin123`

### 5. Running the Application
Launch the local Turbopack development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the storefront, or [http://localhost:3000/admin](http://localhost:3000/admin) to manage store operations.

---

## Service Integrations

### MongoDB Atlas Setup
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Go to **Network Access** and add `0.0.0.0/0` (or whitelist your local IP address).
3. Under **Database Access**, create a user with read/write access.
4. Copy the cluster connection string and paste it into `.env.local` as `MONGODB_URI`.

### Cloudinary Uploads Setup
If you want to support administrative image uploads:
1. Register a free account on [Cloudinary](https://cloudinary.com).
2. Copy your **Cloud Name**, **API Key**, and **API Secret** from the dashboard.
3. Paste them into `.env.local`. If left blank, file uploads will automatically fall back to saving locally inside the `/public/uploads/` directory.

### Nodemailer / SMTP Setup
Automated invoice dispatches are configured via SMTP:
1. Log into your Google Account, navigate to **Security** settings, and enable **2-Step Verification**.
2. Under **App Passwords**, generate a new application-specific password (e.g., name it "Get Online Store").
3. Set `EMAIL_USER` to your Gmail address and `EMAIL_APP_PASSWORD` to the 16-character code Google generated.
4. If left blank, emails will fallback to logging mock HTML outputs to the terminal console during local testing.

---

## Production Deployment Steps

### Next.js Production Build
Always verify compiling and linting before packaging for production:
```bash
# Run TypeScript compilation and static page generation
npm run build

# Run linter checks
npm run lint
```

### Hosting on Vercel
1. Push your code repository to GitHub or GitLab.
2. Link the repository to your [Vercel Dashboard](https://vercel.com).
3. Under **Environment Variables**, copy the keys from `.env.local`.
4. Deploy the project. Vercel automatically detects Next.js configurations.
