import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "welcome": "Welcome to KMRL Document Management",
      "login": "Login",
      "logout": "Logout",
      "username": "Username",
      "password": "Password",
      "email": "Email",
      "firstName": "First Name",
      "lastName": "Last Name",
      "role": "Role",
      "register": "Register",
      "dashboard": "Dashboard",
      "documents": "Documents",
      "upload": "Upload Document",
      "search": "Search",
      "fileName": "File Name",
      "uploadDate": "Upload Date",
      "tags": "Tags",
      "status": "Status",
      "actions": "Actions",
      "view": "View",
      "download": "Download",
      "chat": "Chat",
      "globalSearch": "Global Search",
      "documentChat": "Document Chat",
      "askQuestion": "Ask a question about this document...",
      "send": "Send",
      "summary": "Summary",
      "uploadDocument": "Upload Document",
      "selectFile": "Select File",
      "supportedFormats": "Supported formats: PDF, DOCX, Images",
      "processing": "Processing...",
      "language": "Language",
      "english": "English",
      "malayalam": "Malayalam",
      "sensitivity": "Sensitivity Level",
      "allowedRoles": "Allowed Roles",
      "confidence": "AI Confidence",
      "leadership": "Leadership",
      "hr": "HR",
      "finance": "Finance",
      "engineer": "Engineer",
      "admin": "Admin",
      "imagesFound": "Images Found",
      "relevantImages": "Relevant Images",
      "extractedImages": "Extracted Images",
      "noImagesFound": "No images found",
      "imageFromPage": "Image from page {{page}}",
      "ocrText": "OCR Text",
      "languagesDetected": "Languages Detected",
      "multilingualContent": "Multilingual Content",
      "imageSearch": "Search Images",
      "searchInImages": "Search in extracted images...",
      "viewFullImage": "View Full Image",
      "error": {
        "documentNotFound": "Document not found",
        "chatFailed": "Failed to send message",
        "imageLoadFailed": "Failed to load image"
      },
      "common": {
        "back": "Back",
        "close": "Close",
        "loading": "Loading...",
        "error": "Error"
      },
      "document": {
        "details": "Document Details",
        "download": "Download",
        "uploadDate": "Upload Date",
        "fileSize": "File Size",
        "sensitivity": "Sensitivity",
        "aiConfidence": "AI Confidence",
        "tags": "Tags",
        "allowedRoles": "Allowed Roles",
        "summary": "Summary",
        "noSummary": "No summary available",
        "chat": "Document Chat",
        "askQuestion": "Ask a question about this document..."
      }
    }
  },
  ml: {
    translation: {
      "welcome": "KMRL ഡോക്യുമെന്റ് മാനേജ്മെന്റിലേക്ക് സ്വാഗതം",
      "login": "ലോഗിൻ",
      "logout": "ലോഗൗട്ട്",
      "username": "ഉപയോക്തൃനാമം",
      "password": "പാസ്‌വേഡ്",
      "email": "ഇമെയിൽ",
      "firstName": "പേര്",
      "lastName": "കുടുംബപ്പേര്",
      "role": "റോൾ",
      "register": "രജിസ്റ്റർ",
      "dashboard": "ഡാഷ്‌ബോർഡ്",
      "documents": "ഡോക്യുമെന്റുകൾ",
      "upload": "ഡോക്യുമെന്റ് അപ്‌ലോഡ് ചെയ്യുക",
      "search": "തിരയുക",
      "fileName": "ഫയൽ നാമം",
      "uploadDate": "അപ്‌ലോഡ് തീയതി",
      "tags": "ടാഗുകൾ",
      "status": "സ്ഥിതി",
      "actions": "പ്രവർത്തനങ്ങൾ",
      "view": "കാണുക",
      "download": "ഡൗൺലോഡ്",
      "chat": "ചാറ്റ്",
      "globalSearch": "ഗ്ലോബൽ സെർച്ച്",
      "documentChat": "ഡോക്യുമെന്റ് ചാറ്റ്",
      "askQuestion": "ഈ ഡോക്യുമെന്റിനെക്കുറിച്ച് ഒരു ചോദ്യം ചോദിക്കുക...",
      "send": "അയയ്ക്കുക",
      "summary": "സംഗ്രഹം",
      "uploadDocument": "ഡോക്യുമെന്റ് അപ്‌ലോഡ് ചെയ്യുക",
      "selectFile": "ഫയൽ തിരഞ്ഞെടുക്കുക",
      "supportedFormats": "പിന്തുണയ്ക്കുന്ന ഫോർമാറ്റുകൾ: PDF, DOCX, ചിത്രങ്ങൾ",
      "processing": "പ്രോസസ്സിംഗ്...",
      "language": "ഭാഷ",
      "english": "ഇംഗ്ലീഷ്",
      "malayalam": "മലയാളം",
      "sensitivity": "സെൻസിറ്റിവിറ്റി ലെവൽ",
      "allowedRoles": "അനുവദനീയമായ റോളുകൾ",
      "confidence": "AI ആത്മവിശ്വാസം",
      "leadership": "നേതൃത്വം",
      "hr": "HR",
      "finance": "ഫിനാൻസ്",
      "engineer": "എൻജിനീയർ",
      "admin": "അഡ്മിൻ",
      "imagesFound": "ചിത്രങ്ങൾ കണ്ടെത്തി",
      "relevantImages": "പ്രസക്തമായ ചിത്രങ്ങൾ",
      "extractedImages": "എക്‌സ്‌ട്രാക്റ്റ് ചെയ്ത ചിത്രങ്ങൾ",
      "noImagesFound": "ചിത്രങ്ങൾ കണ്ടെത്തിയില്ല",
      "imageFromPage": "പേജ് {{page}} ൽ നിന്നുള്ള ചിത്രം",
      "ocrText": "OCR ടെക്‌സ്റ്റ്",
      "languagesDetected": "കണ്ടെത്തിയ ഭാഷകൾ",
      "multilingualContent": "ബഹുഭാഷാ ഉള്ളടക്കം",
      "imageSearch": "ചിത്രങ്ങൾ തിരയുക",
      "searchInImages": "എക്‌സ്‌ട്രാക്റ്റ് ചെയ്ത ചിത്രങ്ങളിൽ തിരയുക...",
      "viewFullImage": "പൂർണ്ണ ചിത്രം കാണുക",
      "error": {
        "documentNotFound": "ഡോക്യുമെന്റ് കണ്ടെത്തിയില്ല",
        "chatFailed": "സന്ദേശം അയയ്ക്കാൻ പരാജയപ്പെട്ടു",
        "imageLoadFailed": "ചിത്രം ലോഡ് ചെയ്യാൻ പരാജയപ്പെട്ടു"
      },
      "common": {
        "back": "തിരികെ",
        "close": "അടയ്ക്കുക",
        "loading": "ലോഡിംഗ്...",
        "error": "പിശക്"
      },
      "document": {
        "details": "ഡോക്യുമെന്റ് വിവരങ്ങൾ",
        "download": "ഡൗൺലോഡ്",
        "uploadDate": "അപ്‌ലോഡ് തീയതി",
        "fileSize": "ഫയൽ വലുപ്പം",
        "sensitivity": "സെൻസിറ്റിവിറ്റി",
        "aiConfidence": "AI ആത്മവിശ്വാസം",
        "tags": "ടാഗുകൾ",
        "allowedRoles": "അനുവദനീയമായ റോളുകൾ",
        "summary": "സംഗ്രഹം",
        "noSummary": "സംഗ്രഹം ലഭ്യമല്ല",
        "chat": "ഡോക്യുമെന്റ് ചാറ്റ്",
        "askQuestion": "ഈ ഡോക്യുമെന്റിനെക്കുറിച്ച് ഒരു ചോദ്യം ചോദിക്കുക..."
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: true,
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
