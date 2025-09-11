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
      "admin": "Admin"
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
      "admin": "അഡ്മിൻ"
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
