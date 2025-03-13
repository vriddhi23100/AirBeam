# **AirBeam**  

AirBeam is a fast and secure file-sharing platform that allows users to upload files and share them using a unique access code. The files remain uncompressed, ensuring full-quality transfers. Uploaded files automatically expire after a set duration or a limited number of downloads, maintaining privacy and security. The platform is accessible on both mobile and desktop and features a minimal, modern UI built with Tailwind CSS.  

## **Tech Stack**  
AirBeam is built using Vite for a fast and optimized frontend with React and Tailwind CSS for styling. The backend is powered by Node.js with TypeScript and Express, ensuring scalability and reliability. Supabase (which is based on PostgreSQL) handles authentication and file storage, while Vercel is used for seamless deployment.  

## **Setup & Installation**  

### **1. Clone the repository**  
```bash
git clone https://github.com/vriddhi23100/airbeam.git
cd airbeam
```

### **2. Install dependencies**  
```bash
npm install
```

### **3. Set up environment variables**  
Create a `.env` file and add:  
```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### **4. Run the project**  
```bash
npm run dev
```

## **Deployment**  
AirBeam is deployed on Vercel. Ensure that the `.env` variables are configured properly before deploying.  

## **Future Improvements**  
**WebRTC-Based P2P Transfers** (Faster direct transfers)  
**End-to-End Encryption** (Secure file storage)  
**Folder Upload Support** (ZIP compression)  
**Custom Expiry Links** (User-defined auto-deletion)  

## **Contact**  
**Email:** vriddhi23100@iiitnr.edu.in

**Contributions Welcome!** Feel free to open an issue or submit a PR.  

## **License**  
This project is licensed under the **MIT License**.  
