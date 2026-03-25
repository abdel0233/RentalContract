import React, { useState, useRef, useEffect } from 'react';
import { Loader2, CheckCircle2, AlertTriangle, Calendar, Users, MapPin, CreditCard, WifiOff, Home, XCircle } from 'lucide-react';
import FileUpload from './components/FileUpload';
import SignaturePad from './components/SignaturePad';

// ---------------------------------------------------------------------------
// Translations
// ---------------------------------------------------------------------------
const T = {
    en: {
        pageTitle: 'Rental Contract Form',
        managedBy: 'Managed by',
        pageSubtitle: 'Please fill out the details below to complete your registration.',
        // language buttons
        lang: { en: 'EN', fr: 'FR', ar: 'AR' },
        // sections
        guestInfo: 'Guest Information',
        reservationDetails: 'Reservation Details',
        identityDocuments: 'Identity Documents',
        termsSection: 'Terms & Conditions',
        // guest fields
        fullName: 'Full Name',
        fullNamePlaceholder: 'John Doe',
        dateOfBirth: 'Date of Birth',
        nationality: 'Nationality',
        nationalityPlaceholder: 'Select nationality…',
        phone: 'Phone Number',
        email: 'Email Address',
        clause6: '6. Moroccan Law: The tenant agrees to comply with applicable Moroccan law, particularly regarding accommodation and cohabitation of unmarried persons, and declares full responsibility in case of non-compliance with applicable legal provisions.',
        idType: 'ID Type',
        idNumber: 'ID Number',
        nationalId: 'National ID',
        passport: 'Passport',
        driverLicense: 'Driver License',
        // reservation fields
        checkIn: 'Check-in Date',
        checkOut: 'Check-out Date',
        guests: 'Number of Guests',
        address: 'Apartment Address',
        autoFilled: '(auto-filled)',
        // id uploads
        idFront: 'ID Front',
        idBack: 'ID Back',
        // contract terms
        contractTitle: 'Short-Term Rental Contract',
        contractIntro: 'The "Tenant", whose information has been filled in the form above, has agreed to the following:',
        clause1: '1. Subject of the contract: The Landlord rents the accommodation indicated above to the Tenant for a short period.',
        clause2: '2. Rent and charges: The rental amount is set on online rental platforms (Airbnb, Booking or others).',
        clause3: '3. Liability: The Landlord declines any responsibility regarding the presence of unmarried Moroccan couples in the accommodation.',
        clause4: '4. Prohibitions: The Tenant agrees to respect the rules of the accommodation.',
        clause5: '5. The Tenant certifies having read and accepted all the conditions mentioned above.',
        termsCheckbox: 'I hereby certify that I have read and accepted all the terms and conditions above. I confirm that all information provided is accurate.',
        // buttons
        submit: 'Submit Contract',
        submitting: 'Submitting...',
        submitAnother: 'Submit Another',
        // success
        successTitle: 'Submission Successful!',
        successMessage: 'Your rental contract has been submitted. You will receive a copy by email.',
        // errors
        errorTerms: 'Please accept the terms to proceed.',
        errorDates: 'Check-out must be after check-in.',
        errorId: 'Please upload both front and back of your ID.',
        errorExtraGuests: 'Please upload ID for all additional guests.',
        errorSignature: 'Please sign the contract.',
        errorWebhook: 'Failed to submit form. Please try again.',
        errorWebhookMissing: 'Webhook URL is missing in environment variables.',
        confirmEmail: 'Confirm Email Address',
        errorEmailMismatch: 'Email addresses do not match. Please check and try again.',
        // error screens
        loading: 'Loading apartment details…',
        invalidLinkTitle: 'Invalid Link',
        invalidLinkMsg: 'No apartment was specified in this link. Please use the link provided by your host.',
        notFoundTitle: 'Property Not Found',
        notFoundMsg: "We couldn't find an apartment matching this link. Please contact your host.",
        notActiveTitle: 'Link Not Active',
        notActiveMsg: 'This rental link is currently inactive. Please contact your host for a valid link.',
        fetchErrorTitle: 'Connection Error',
        fetchErrorMsg: "We couldn't load apartment information. Please check your internet connection and try again.",
        footer: 'Rental Agency. All rights reserved.',
    },
    fr: {
        pageTitle: 'Formulaire de Contrat de Location',
        managedBy: 'Géré par',
        pageSubtitle: 'Veuillez remplir les informations ci-dessous pour finaliser votre inscription.',
        lang: { en: 'EN', fr: 'FR', ar: 'AR' },
        guestInfo: 'Informations du Locataire',
        reservationDetails: 'Détails de la Réservation',
        identityDocuments: 'Pièces d\'identité',
        termsSection: 'Conditions Générales',
        fullName: 'Nom complet',
        fullNamePlaceholder: 'Jean Dupont',
        dateOfBirth: 'Date de naissance',
        nationality: 'Nationalité',
        nationalityPlaceholder: 'Sélectionner la nationalité…',
        phone: 'Téléphone',
        email: 'Adresse Email',
        clause6: '6. Législation marocaine : Le locataire s\'engage à respecter la législation marocaine en vigueur, notamment en ce qui concerne l\'hébergement et la cohabitation de personnes non mariées, et déclare assumer l\'entière responsabilité en cas de non-respect des dispositions légales applicables.',
        idType: 'Type de pièce d\'identité',
        idNumber: 'Numéro d\'identité',
        nationalId: 'Carte Nationale',
        passport: 'Passeport',
        driverLicense: 'Permis de conduire',
        checkIn: 'Date d\'entrée',
        checkOut: 'Date de sortie',
        guests: 'Nombre de personnes',
        address: 'Adresse du logement',
        autoFilled: '(rempli automatiquement)',
        idFront: 'Recto de la pièce d\'identité',
        idBack: 'Verso de la pièce d\'identité',
        contractTitle: 'Contrat de Location à Courte Durée',
        contractIntro: 'Le « Locataire », dont les informations ont été remplies dans le formulaire ci-haut, a été convenu ce qui suit :',
        clause1: '1. Objet du contrat : Le Bailleur loue au Locataire le logement indiqué ci-haut pour une courte durée.',
        clause2: '2. Loyer et charges : Le montant du loyer est fixé sur les plateformes en ligne de location (Airbnb, Booking ou autres).',
        clause3: '3. Responsabilité : Le Bailleur décline toute responsabilité quant à la présence de couples marocains non mariés dans le logement.',
        clause4: '4. Interdictions : Le Locataire s\'engage à respecter les règles du logement.',
        clause5: '5. Le Locataire certifie avoir pris connaissance et accepté l\'ensemble des conditions mentionnées ci-dessus.',
        termsCheckbox: 'Je soussigné(e) certifie avoir pris connaissance et accepté l\'ensemble des conditions mentionnées ci-dessus. J\'atteste que les informations fournies sont exactes.',
        submit: 'Soumettre le contrat',
        submitting: 'Envoi en cours...',
        submitAnother: 'Soumettre un autre',
        successTitle: 'Soumission réussie !',
        successMessage: 'Votre contrat a été soumis. Vous recevrez une copie par email.',
        errorTerms: 'Veuillez accepter les conditions pour continuer.',
        errorDates: 'La date de sortie doit être après la date d\'entrée.',
        errorId: 'Veuillez télécharger le recto et le verso de votre pièce d\'identité.',
        errorExtraGuests: 'Veuillez télécharger la pièce d\'identité de tous les autres locataires.',
        errorSignature: 'Veuillez signer le contrat.',
        errorWebhook: 'Échec de la soumission. Veuillez réessayer.',
        errorWebhookMissing: 'URL du webhook manquante dans les variables d\'environnement.',
        confirmEmail: 'Confirmer l\'adresse email',
        errorEmailMismatch: 'Les adresses email ne correspondent pas. Veuillez vérifier et réessayer.',
        loading: 'Chargement des informations du logement…',
        invalidLinkTitle: 'Lien invalide',
        invalidLinkMsg: 'Aucun appartement n\'a été spécifié dans ce lien. Veuillez utiliser le lien fourni par votre hôte.',
        notFoundTitle: 'Propriété introuvable',
        notFoundMsg: 'Nous n\'avons pas trouvé d\'appartement correspondant à ce lien. Veuillez contacter votre hôte.',
        notActiveTitle: 'Lien inactif',
        notActiveMsg: 'Ce lien de location est actuellement inactif. Veuillez contacter votre hôte pour un lien valide.',
        fetchErrorTitle: 'Erreur de connexion',
        fetchErrorMsg: 'Impossible de charger les informations du logement. Vérifiez votre connexion internet et réessayez.',
        footer: 'Agence de location. Tous droits réservés.',
    },
    ar: {
        pageTitle: 'نموذج عقد الإيجار',
        managedBy: 'تحت إشراف',
        pageSubtitle: 'يرجى ملء البيانات أدناه لإتمام التسجيل.',
        lang: { en: 'EN', fr: 'FR', ar: 'AR' },
        guestInfo: 'معلومات المستأجر',
        reservationDetails: 'تفاصيل الحجز',
        identityDocuments: 'وثائق الهوية',
        termsSection: 'الشروط والأحكام',
        fullName: 'الاسم الكامل',
        fullNamePlaceholder: 'محمد الأمين',
        dateOfBirth: 'تاريخ الميلاد',
        nationality: 'الجنسية',
        nationalityPlaceholder: 'اختر الجنسية…',
        phone: 'رقم الهاتف',
        email: 'البريد الإلكتروني',
        clause6: '6. التشريع المغربي: يلتزم المستأجر باحترام التشريعات المغربية المعمول بها، ولا سيما فيما يتعلق بالإيواء والتعايش بين الأشخاص غير المتزوجين، ويُقر بتحمله المسؤولية الكاملة في حالة عدم الامتثال للأحكام القانونية المطبقة.',
        idType: 'نوع الهوية',
        idNumber: 'رقم الهوية',
        nationalId: 'بطاقة وطنية',
        passport: 'جواز سفر',
        driverLicense: 'رخصة القيادة',
        checkIn: 'تاريخ الوصول',
        checkOut: 'تاريخ المغادرة',
        guests: 'عدد الأشخاص',
        address: 'عنوان الشقة',
        autoFilled: '(مُعبأ تلقائياً)',
        idFront: 'الوجه الأمامي للهوية',
        idBack: 'الوجه الخلفي للهوية',
        contractTitle: 'عقد إيجار قصير الأمد',
        contractIntro: '«المستأجر»، الذي أدخل معلوماته في النموذج أعلاه، اتفق على ما يلي:',
        clause1: '1. موضوع العقد: يؤجر المؤجر للمستأجر السكن المذكور أعلاه لمدة قصيرة.',
        clause2: '2. الإيجار والرسوم: يتم تحديد مبلغ الإيجار عبر منصات الحجز الإلكترونية (Airbnb، Booking أو غيرها).',
        clause3: '3. المسؤولية: يتبرأ المؤجر من أي مسؤولية تتعلق بوجود أزواج مغاربة غير متزوجين في السكن.',
        clause4: '4. المحظورات: يلتزم المستأجر باحترام قواعد السكن.',
        clause5: '5. يُقر المستأجر بأنه اطلع على جميع الشروط المذكورة أعلاه وقبلها.',
        termsCheckbox: 'أنا الموقع أدناه أقر بأنني اطلعت على جميع الشروط والأحكام المذكورة أعلاه وقبلتها. وأؤكد أن جميع المعلومات المقدمة صحيحة.',
        submit: 'إرسال العقد',
        submitting: 'جارٍ الإرسال...',
        submitAnother: 'إرسال نموذج آخر',
        successTitle: 'تم الإرسال بنجاح!',
        successMessage: 'تم إرسال عقد الإيجار الخاص بك. ستتلقى نسخة على بريدك الإلكتروني.',
        errorTerms: 'يرجى قبول الشروط للمتابعة.',
        errorDates: 'يجب أن يكون تاريخ المغادرة بعد تاريخ الوصول.',
        errorId: 'يرجى رفع الوجهين الأمامي والخلفي للهوية.',
        errorExtraGuests: 'يرجى رفع هوية جميع المستأجرين الإضافيين.',
        errorSignature: 'يرجى التوقيع على العقد.',
        errorWebhook: 'فشل إرسال النموذج. يرجى المحاولة مرة أخرى.',
        errorWebhookMissing: 'رابط الـ webhook مفقود في متغيرات البيئة.',
        confirmEmail: 'تأكيد البريد الإلكتروني',
        errorEmailMismatch: 'عناوين البريد الإلكتروني غير متطابقة. يرجى التحقق والمحاولة مرة أخرى.',
        loading: 'جارٍ تحميل تفاصيل الشقة…',
        invalidLinkTitle: 'رابط غير صالح',
        invalidLinkMsg: 'لم يتم تحديد أي شقة في هذا الرابط. يرجى استخدام الرابط المقدم من مضيفك.',
        notFoundTitle: 'العقار غير موجود',
        notFoundMsg: 'لم نتمكن من العثور على شقة تطابق هذا الرابط. يرجى التواصل مع مضيفك.',
        notActiveTitle: 'الرابط غير نشط',
        notActiveMsg: 'رابط الإيجار هذا غير نشط حالياً. يرجى التواصل مع مضيفك للحصول على رابط صالح.',
        fetchErrorTitle: 'خطأ في الاتصال',
        fetchErrorMsg: 'تعذّر تحميل معلومات الشقة. يرجى التحقق من اتصالك بالإنترنت والمحاولة مجدداً.',
        footer: 'وكالة التأجير. جميع الحقوق محفوظة.',
    },
};

// ---------------------------------------------------------------------------
// CSV parsing helper
// ---------------------------------------------------------------------------
function parseCSV(text) {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    return lines.slice(1).map(line => {
        const fields = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (ch === '"') {
                if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
                else { inQuotes = !inQuotes; }
            } else if (ch === ',' && !inQuotes) {
                fields.push(current.trim()); current = '';
            } else { current += ch; }
        }
        fields.push(current.trim());
        const row = {};
        headers.forEach((h, idx) => { row[h] = fields[idx] !== undefined ? fields[idx] : ''; });
        return row;
    });
}

// ---------------------------------------------------------------------------
// Error card component
// ---------------------------------------------------------------------------
function ErrorCard({ icon: Icon, title, message, iconColor = 'text-red-500', bgColor = 'bg-red-50', borderColor = 'border-red-200' }) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className={`bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border ${borderColor}`}>
                <div className={`mx-auto w-16 h-16 ${bgColor} rounded-full flex items-center justify-center mb-4`}>
                    <Icon className={`w-8 h-8 ${iconColor}`} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
                <p className="text-gray-500">{message}</p>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Loading spinner screen
// ---------------------------------------------------------------------------
function LoadingScreen({ text }) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-10 max-w-sm w-full flex flex-col items-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-600 font-medium">{text}</p>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Country list
// ---------------------------------------------------------------------------
const PRIORITY_COUNTRIES = [
    'Morocco', 'France', 'Algeria', 'Tunisia', 'Spain', 'Italy',
    'Germany', 'Belgium', 'Netherlands', 'United Kingdom', 'United States', 'Canada',
];
const ALL_OTHER_COUNTRIES = [
    'Afghanistan', 'Albania', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan',
    'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina',
    'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia', 'Cameroon',
    'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica', 'Croatia', 'Cuba',
    'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador',
    'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'Gabon', 'Gambia', 'Georgia', 'Ghana',
    'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India',
    'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait',
    'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg',
    'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico',
    'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal',
    'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway', 'Oman', 'Pakistan', 'Palau',
    'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania',
    'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino',
    'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia',
    'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Korea', 'South Sudan', 'Sri Lanka', 'Sudan', 'Suriname',
    'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga',
    'Trinidad and Tobago', 'Turkey', 'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'Uruguay',
    'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe',
].sort();
const COUNTRIES = [...PRIORITY_COUNTRIES, ...ALL_OTHER_COUNTRIES];

// ---------------------------------------------------------------------------
// Main App
// ---------------------------------------------------------------------------
function App() {
    // --- Language state ---
    const [lang, setLang] = useState(() => {
        return localStorage.getItem('rentalFormLang') || 'fr';
    });
    const t = T[lang];
    const isRtl = lang === 'ar';

    const changeLang = (l) => {
        setLang(l);
        localStorage.setItem('rentalFormLang', l);
    };

    // inject Noto Sans Arabic when Arabic selected
    useEffect(() => {
        const id = 'noto-sans-arabic-link';
        let link = document.getElementById(id);
        if (isRtl) {
            if (!link) {
                link = document.createElement('link');
                link.id = id;
                link.rel = 'stylesheet';
                link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap';
                document.head.appendChild(link);
            }
        }
    }, [isRtl]);

    // --- Apartment state ---
    const [aptStatus, setAptStatus] = useState('loading');
    const [aptData, setAptData] = useState(null);
    const [aptId, setAptId] = useState('');

    // --- Form state ---
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    const sigPadRef = useRef(null);
    const formRef = useRef(null);

    const [formData, setFormData] = useState({
        fullName: '',
        dateOfBirth: '',
        nationality: '',
        idType: 'National ID',
        idNumber: '',
        phone: '',
        email: '',
        confirmEmail: '',
        checkInDate: '',
        checkOutDate: '',
        guests: 1,
        address: '',
        termsAccepted: false,
    });

    const [files, setFiles] = useState({ idFront: null, idBack: null });
    const [extraGuestFiles, setExtraGuestFiles] = useState({});
    const [guestsInput, setGuestsInput] = useState('1');

    const handleExtraGuestFile = (guestIndex, file) => {
        setExtraGuestFiles(prev => ({ ...prev, [`guestIdFront_${guestIndex}`]: file }));
    };

    // -----------------------------------------------------------------------
    // On mount: read ?apt= and fetch sheet
    // -----------------------------------------------------------------------
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const apt = params.get('apt');
        if (!apt) { setAptStatus('no_param'); return; }
        setAptId(apt);
        const csvUrl = import.meta.env.VITE_SHEET_CSV_URL;
        fetch(csvUrl)
            .then(res => { if (!res.ok) throw new Error('fetch_failed'); return res.text(); })
            .then(text => {
                const rows = parseCSV(text);
                const row = rows.find(r => r.apt_id === apt);
                if (!row) { setAptStatus('not_found'); return; }
                if (String(row.is_active).toLowerCase() !== 'true') { setAptStatus('not_active'); return; }
                setAptData({ apt_id: row.apt_id, address: row.address, owner_name: row.owner_name, owner_email: row.owner_email, owner_phone: row.owner_phone || '', drive_folder_id: row.drive_folder_id, max_guests: parseInt(row.max_guests) || 1 });
                setFormData(prev => ({ ...prev, address: row.address }));
                setAptStatus('ok');
            })
            .catch(() => setAptStatus('fetch_error'));
    }, []);

    // -----------------------------------------------------------------------
    // Handlers
    // -----------------------------------------------------------------------
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleFileChange = (name, file) => {
        setFiles(prev => ({ ...prev, [name]: file }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (formData.email !== formData.confirmEmail) { setError(t.errorEmailMismatch); return; }
        if (!formData.termsAccepted) { setError(t.errorTerms); return; }
        if (new Date(formData.checkOutDate) <= new Date(formData.checkInDate)) { setError(t.errorDates); return; }
        if (!files.idFront || !files.idBack) { setError(t.errorId); return; }
        if (formData.guests > 1) {
            for (let i = 2; i <= formData.guests; i++) {
                if (!extraGuestFiles[`guestIdFront_${i}`]) { setError(t.errorExtraGuests); return; }
            }
        }
        if (sigPadRef.current.isEmpty()) { setError(t.errorSignature); return; }

        setLoading(true);
        try {
            const formPayload = new FormData();
            formPayload.append('fullName', formData.fullName);
            formPayload.append('dateOfBirth', formData.dateOfBirth);
            formPayload.append('nationality', formData.nationality);
            formPayload.append('idType', formData.idType);
            formPayload.append('idNumber', formData.idNumber);
            formPayload.append('phone', formData.phone);
            formPayload.append('email', formData.email);
            formPayload.append('checkInDate', formData.checkInDate);
            formPayload.append('checkOutDate', formData.checkOutDate);
            formPayload.append('guests', formData.guests);
            formPayload.append('address', formData.address);
            formPayload.append('termsAccepted', formData.termsAccepted);
            formPayload.append('language', lang);
            formPayload.append('aptId', aptId);
            formPayload.append('ownerEmail', aptData.owner_email);
            formPayload.append('driveFolderId', aptData.drive_folder_id);
            formPayload.append('ownerName', aptData.owner_name);
            formPayload.append('ownerPhone', aptData.owner_phone || '');
            formPayload.append('idFront', files.idFront);
            formPayload.append('idBack', files.idBack);
            Object.entries(extraGuestFiles).forEach(([key, file]) => {
                formPayload.append(key, file);
            });
            const signatureCanvas = sigPadRef.current.getTrimmedCanvas();
            formPayload.append('signaturePngBase64', signatureCanvas.toDataURL('image/png'));

            const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;
            const apiKey = import.meta.env.VITE_API_KEY;
            if (!webhookUrl) throw new Error(t.errorWebhookMissing);

            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'x-api-key': apiKey || '' },
                body: formPayload,
            });
            if (!response.ok) throw new Error(t.errorWebhook);

            setSuccess(true);
            setFormData({ fullName: '', dateOfBirth: '', nationality: '', idType: 'National ID', idNumber: '', phone: '', email: '', confirmEmail: '', checkInDate: '', checkOutDate: '', guests: 1, address: aptData ? aptData.address : '', termsAccepted: false });
            setGuestsInput('1');
            setFiles({ idFront: null, idBack: null });
            setExtraGuestFiles({});
            sigPadRef.current.clear();
            window.scrollTo(0, 0);
        } catch (err) {
            console.error(err);
            setError(err.message || t.errorWebhook);
        } finally {
            setLoading(false);
        }
    };

    // -----------------------------------------------------------------------
    // RTL / font style
    // -----------------------------------------------------------------------
    const pageStyle = isRtl ? { fontFamily: "'Noto Sans Arabic', sans-serif", direction: 'rtl' } : {};

    // -----------------------------------------------------------------------
    // Language toggle bar (rendered in header)
    // -----------------------------------------------------------------------
    const LangSwitcher = () => (
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {['en', 'fr', 'ar'].map(l => (
                <button
                    key={l}
                    type="button"
                    onClick={() => changeLang(l)}
                    className={`px-3 py-1 rounded-md text-sm font-semibold transition-all ${lang === l
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    {T.en.lang[l]}
                </button>
            ))}
        </div>
    );

    // -----------------------------------------------------------------------
    // Render based on aptStatus
    // -----------------------------------------------------------------------
    if (aptStatus === 'loading') return <LoadingScreen text={t.loading} />;
    if (aptStatus === 'no_param') return <ErrorCard icon={XCircle} title={t.invalidLinkTitle} message={t.invalidLinkMsg} iconColor="text-red-500" bgColor="bg-red-50" borderColor="border-red-200" />;
    if (aptStatus === 'not_found') return <ErrorCard icon={Home} title={t.notFoundTitle} message={t.notFoundMsg} iconColor="text-orange-500" bgColor="bg-orange-50" borderColor="border-orange-200" />;
    if (aptStatus === 'not_active') return <ErrorCard icon={AlertTriangle} title={t.notActiveTitle} message={t.notActiveMsg} iconColor="text-yellow-500" bgColor="bg-yellow-50" borderColor="border-yellow-200" />;
    if (aptStatus === 'fetch_error') return <ErrorCard icon={WifiOff} title={t.fetchErrorTitle} message={t.fetchErrorMsg} iconColor="text-gray-500" bgColor="bg-gray-100" borderColor="border-gray-200" />;

    // -----------------------------------------------------------------------
    // Success screen
    // -----------------------------------------------------------------------
    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" style={pageStyle}>
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.successTitle}</h2>
                    <p className="text-gray-600 mb-6">{t.successMessage}</p>
                    <button onClick={() => setSuccess(false)} className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition">
                        {t.submitAnother}
                    </button>
                </div>
            </div>
        );
    }

    // -----------------------------------------------------------------------
    // Main form
    // -----------------------------------------------------------------------
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8" style={pageStyle}>
            <div className="max-w-3xl mx-auto">

                {/* Header */}
                <header className="text-center mb-10">
                    {/* Language switcher — always on top */}
                    <div className="flex justify-end mb-4">
                        <LangSwitcher />
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{t.pageTitle}</h1>
                    {aptData?.owner_name && (
                        <p className="mt-1 text-blue-600 font-medium">{t.managedBy} {aptData.owner_name}</p>
                    )}
                    <p className="mt-2 text-gray-600">{t.pageSubtitle}</p>
                </header>

                <form ref={formRef} onSubmit={handleSubmit} className="bg-white shadow-xl rounded-2xl overflow-hidden">

                    {/* Section: Guest Information */}
                    <div className="p-8 border-b border-gray-100">
                        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-600 flex-shrink-0" />
                            {t.guestInfo}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Full Name */}
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t.fullName} *</label>
                                <input type="text" name="fullName" required value={formData.fullName} onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" />
                            </div>

                            {/* Date of Birth */}
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t.dateOfBirth} *</label>
                                <input type="date" name="dateOfBirth" required value={formData.dateOfBirth} onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" />
                            </div>

                            {/* Nationality */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t.nationality} *</label>
                                <select name="nationality" required value={formData.nationality} onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white">
                                    <option value="">{t.nationalityPlaceholder}</option>
                                    {COUNTRIES.map(country => <option key={country} value={country}>{country}</option>)}
                                </select>
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t.phone} *</label>
                                <input type="tel" name="phone" required value={formData.phone} onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" />
                            </div>

                            {/* Email */}
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t.email} *</label>
                                <input type="email" name="email" required value={formData.email} onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" />
                            </div>

                            {/* Confirm Email */}
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t.confirmEmail} *</label>
                                <input
                                    type="email"
                                    name="confirmEmail"
                                    required
                                    value={formData.confirmEmail}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                />
                            </div>

                            {/* ID Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t.idType}</label>
                                <select name="idType" value={formData.idType} onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white">
                                    <option value="National ID">{t.nationalId}</option>
                                    <option value="Passport">{t.passport}</option>
                                    <option value="Driver License">{t.driverLicense}</option>
                                </select>
                            </div>

                            {/* ID Number */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t.idNumber} *</label>
                                <input type="text" name="idNumber" required value={formData.idNumber} onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" />
                            </div>
                        </div>
                    </div>

                    {/* Section: Reservation Details */}
                    <div className="p-8 border-b border-gray-100 bg-gray-50/50">
                        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0" />
                            {t.reservationDetails}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t.checkIn} *</label>
                                <input type="date" name="checkInDate" required value={formData.checkInDate} onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t.checkOut} *</label>
                                <input type="date" name="checkOutDate" required value={formData.checkOutDate} onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t.guests}</label>
                                <input
                                    type="number"
                                    name="guests"
                                    min="1"
                                    max={aptData?.max_guests || 1}
                                    value={guestsInput}
                                    onChange={(e) => {
                                        setGuestsInput(e.target.value);
                                    }}
                                    onBlur={(e) => {
                                        const numValue = parseInt(e.target.value) || 1;
                                        const maxGuests = aptData?.max_guests || 1;
                                        const capped = Math.min(Math.max(numValue, 1), maxGuests);
                                        setGuestsInput(String(capped));
                                        setFormData(prev => ({ ...prev, guests: capped }));
                                    }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                />
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t.address}
                                    <span className="ml-2 text-xs text-blue-500 font-normal">{t.autoFilled}</span>
                                </label>
                                <textarea name="address" rows="2" value={formData.address} readOnly
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none resize-none bg-gray-50 text-gray-600 cursor-not-allowed" />
                            </div>
                        </div>
                    </div>

                    {/* Section: ID Uploads */}
                    <div className="p-8 border-b border-gray-100 bg-gray-50/50">
                        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0" />
                            {t.identityDocuments}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FileUpload label={t.idFront} name="idFront" required onChange={handleFileChange} />
                            <FileUpload label={t.idBack} name="idBack" required onChange={handleFileChange} />
                        </div>
                    </div>

                    {/* Section: Additional Guests ID */}
                    {formData.guests > 1 && (
                        <div className="p-8 border-b border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                                <Users className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                Additional Guests ID
                            </h2>
                            {Array.from({ length: formData.guests - 1 }, (_, i) => i + 2).map(guestIndex => (
                                <div key={guestIndex} className="mb-6">
                                    <h3 className="text-base font-medium text-gray-700 mb-3">Guest {guestIndex}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FileUpload
                                            label={t.idFront}
                                            name={`guestIdFront_${guestIndex}`}
                                            required
                                            onChange={(name, file) => handleExtraGuestFile(guestIndex, file)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Section: Contract Terms & Signature */}
                    <div className="p-8">

                        {/* Contract Terms */}
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                {t.termsSection}
                            </h2>

                            {/* Scrollable terms box */}
                            <div className="h-48 overflow-y-auto border border-gray-300 rounded-lg p-4 bg-gray-50 text-sm text-gray-700 leading-relaxed mb-4">
                                <p className="font-semibold mb-3">{t.contractTitle}</p>
                                <p className="mb-3">{t.contractIntro}</p>
                                <p className="mb-2">{t.clause1}</p>
                                <p className="mb-2">{t.clause2}</p>
                                <p className="mb-2">{t.clause3}</p>
                                <p className="mb-2">{t.clause4}</p>
                                <p className="mb-2">{t.clause5}</p>
                                <p className="mb-2 font-medium text-red-600">{t.clause6}</p>
                            </div>

                            {/* Terms checkbox */}
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <input type="checkbox" name="termsAccepted" required checked={formData.termsAccepted} onChange={handleInputChange}
                                    className="mt-1 w-4 h-4 accent-blue-600 flex-shrink-0" />
                                <span className="text-sm text-gray-700 leading-snug group-hover:text-gray-900 transition">
                                    {t.termsCheckbox}
                                </span>
                            </label>
                        </div>

                        {/* Signature */}
                        <div className="mb-8">
                            <SignaturePad ref={sigPadRef} label="Signature" required />
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700">
                                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}

                        <button type="submit" disabled={loading}
                            className={`w-full py-4 px-6 rounded-xl font-bold text-white shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0
                                ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'}`}>
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    {t.submitting}
                                </span>
                            ) : t.submit}
                        </button>
                    </div>

                </form>

                <p className="text-center text-gray-400 text-sm mt-8 mb-4">
                    &copy; {new Date().getFullYear()} {t.footer}
                </p>

            </div>
        </div>
    );
}

export default App;
