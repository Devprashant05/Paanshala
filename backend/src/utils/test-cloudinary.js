import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

console.log("=== Cloudinary PUBLIC ACCESS Test ===\n");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create test PDF
const testPdfPath = path.join(__dirname, "test-public-invoice.pdf");
const pdfContent = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/Resources<</Font<</F1<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>>>>>/MediaBox[0 0 612 792]/Contents 4 0 R>>endobj
4 0 obj<</Length 44>>stream
BT /F1 12 Tf 100 700 Td (Test Public Invoice) Tj ET
endstream endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000317 00000 n 
trailer<</Size 5/Root 1 0 R>>
startxref
410
%%EOF`;

fs.writeFileSync(testPdfPath, pdfContent);
console.log("✓ Test PDF created\n");

console.log("Testing different upload configurations:\n");

// Test 1: Private (authenticated) - WILL FAIL
console.log("1. Upload as PRIVATE (authenticated):");
try {
    const privateResult = await cloudinary.uploader.upload(testPdfPath, {
        resource_type: "raw",
        folder: "invoices/test",
        public_id: "test-private",
        type: "authenticated", // ❌ Private
    });

    console.log("   ✓ Uploaded:", privateResult.secure_url);

    const privateResponse = await fetch(privateResult.secure_url);
    console.log(
        "   Access test:",
        privateResponse.status,
        privateResponse.statusText
    );

    if (privateResponse.status === 401) {
        console.log(
            "   ❌ 401 Error - Private files require authentication!\n"
        );
    }

    // Cleanup
    await cloudinary.uploader.destroy("invoices/test/test-private", {
        resource_type: "raw",
        type: "authenticated",
    });
} catch (error) {
    console.log("   ❌ Error:", error.message, "\n");
}

// Test 2: Public (upload) - SHOULD WORK
console.log("2. Upload as PUBLIC (upload + access_mode: public):");
try {
    const publicResult = await cloudinary.uploader.upload(testPdfPath, {
        resource_type: "raw",
        folder: "invoices/test",
        public_id: "test-public",
        type: "upload", // ✅ Public delivery type
        access_mode: "public", // ✅ Explicitly public
        format: "pdf",
    });

    console.log("   ✓ Uploaded:", publicResult.secure_url);

    const publicResponse = await fetch(publicResult.secure_url);
    console.log(
        "   Access test:",
        publicResponse.status,
        publicResponse.statusText
    );

    if (publicResponse.status === 200) {
        console.log("   ✅ Success! PDF is publicly accessible!\n");
    } else {
        console.log("   ❌ Error! Status:", publicResponse.status);
        console.log("   This means your Cloudinary account has restrictions.");
        console.log("   Check: Settings → Security → Restricted media types\n");
    }

    // Cleanup
    await cloudinary.uploader.destroy("invoices/test/test-public", {
        resource_type: "raw",
    });
} catch (error) {
    console.log("   ❌ Error:", error.message, "\n");
}

// Cleanup
if (fs.existsSync(testPdfPath)) {
    fs.unlinkSync(testPdfPath);
}

console.log("=== Summary ===");
console.log("✓ For PUBLIC access (users can download):");
console.log("  type: 'upload'");
console.log("  access_mode: 'public'");
console.log("");
console.log("✓ Update your cloudinary.js:");
console.log("  Add these options to uploadPdfToCloudinary");
console.log("");
console.log("✓ If still getting 401:");
console.log("  1. Check Cloudinary dashboard → Settings → Security");
console.log("  2. Ensure 'Raw' files are not restricted");
console.log("  3. Check if strict transformations are disabled");
