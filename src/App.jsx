import React, { useState, useRef, useEffect } from 'react';
import { Loader2, CheckCircle2, AlertTriangle, Calendar, Users, MapPin, DollarSign, CreditCard, WifiOff, Home, XCircle } from 'lucide-react';
import FileUpload from './components/FileUpload';
import SignaturePad from './components/SignaturePad';

// ---------------------------------------------------------------------------
// CSV parsing helper (no external library)
// Handles quoted fields with embedded commas/newlines.
// ---------------------------------------------------------------------------
function parseCSV(text) {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

    return lines.slice(1).map(line => {
        // Simple CSV field parser
        const fields = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (ch === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    current += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (ch === ',' && !inQuotes) {
                fields.push(current.trim());
                current = '';
            } else {
                current += ch;
            }
        }
        fields.push(current.trim());

        const row = {};
        headers.forEach((h, idx) => {
            row[h] = fields[idx] !== undefined ? fields[idx] : '';
        });
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
function LoadingScreen() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-10 max-w-sm w-full flex flex-col items-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-600 font-medium">Loading apartment details…</p>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Main App
// ---------------------------------------------------------------------------
function App() {
    // --- Apartment state ---
    const [aptStatus, setAptStatus] = useState('loading'); // 'loading' | 'ok' | error key
    const [aptData, setAptData] = useState(null); // { apt_id, address, owner_name, owner_email, drive_folder_id }
    const [aptId, setAptId] = useState('');

    // --- Form state ---
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    const sigPadRef = useRef(null);
    const formRef = useRef(null);

    const [formData, setFormData] = useState({
        fullName: '',
        nationality: '',
        idType: 'National ID',
        idNumber: '',
        phone: '',
        email: '',
        checkInDate: '',
        checkOutDate: '',
        guests: 1,
        totalPrice: '',
        deposit: '',
        address: '',
        notes: '',
    });

    const [files, setFiles] = useState({
        idFront: null,
        idBack: null,
    });

    // -----------------------------------------------------------------------
    // On mount: read ?apt= and fetch sheet
    // -----------------------------------------------------------------------
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const apt = params.get('apt');

        if (!apt) {
            setAptStatus('no_param');
            return;
        }

        setAptId(apt);

        const csvUrl = import.meta.env.VITE_SHEET_CSV_URL;

        fetch(csvUrl)
            .then(res => {
                if (!res.ok) throw new Error('fetch_failed');
                return res.text();
            })
            .then(text => {
                const rows = parseCSV(text);
                const row = rows.find(r => r.apt_id === apt);

                if (!row) {
                    setAptStatus('not_found');
                    return;
                }

                if (String(row.is_active).toLowerCase() !== 'true') {
                    setAptStatus('not_active');
                    return;
                }

                setAptData({
                    apt_id: row.apt_id,
                    address: row.address,
                    owner_name: row.owner_name,
                    owner_email: row.owner_email,
                    drive_folder_id: row.drive_folder_id,
                });

                // Auto-fill address
                setFormData(prev => ({ ...prev, address: row.address }));
                setAptStatus('ok');
            })
            .catch(() => {
                setAptStatus('fetch_error');
            });
    }, []);

    // -----------------------------------------------------------------------
    // Handlers
    // -----------------------------------------------------------------------
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (name, file) => {
        setFiles(prev => ({ ...prev, [name]: file }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        // simple validation
        if (new Date(formData.checkOutDate) <= new Date(formData.checkInDate)) {
            setError("Check-out date must be after check-in date.");
            return;
        }

        if (!files.idFront || !files.idBack) {
            setError("Please upload both front and back of your ID.");
            return;
        }

        if (sigPadRef.current.isEmpty()) {
            setError("Please sign the contract.");
            return;
        }

        setLoading(true);

        try {
            const formPayload = new FormData();

            // Append text fields
            Object.entries(formData).forEach(([key, value]) => {
                formPayload.append(key, value);
            });

            // Append apartment-specific fields
            formPayload.append('aptId', aptId);
            formPayload.append('ownerEmail', aptData.owner_email);
            formPayload.append('driveFolderId', aptData.drive_folder_id);
            formPayload.append('ownerName', aptData.owner_name);

            // Append files
            formPayload.append('idFront', files.idFront);
            formPayload.append('idBack', files.idBack);

            // Append signature
            const signatureCanvas = sigPadRef.current.getTrimmedCanvas();
            const signatureDataUrl = signatureCanvas.toDataURL('image/png');
            formPayload.append('signaturePngBase64', signatureDataUrl);

            const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;
            const apiKey = import.meta.env.VITE_API_KEY;

            if (!webhookUrl) {
                throw new Error("Webhook URL is missing in environment variables.");
            }

            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'x-api-key': apiKey || '',
                },
                body: formPayload,
            });

            if (!response.ok) {
                throw new Error("Failed to submit form. Please try again.");
            }

            setSuccess(true);
            // Reset form (keep address from sheet)
            setFormData({
                fullName: '',
                nationality: '',
                idType: 'National ID',
                idNumber: '',
                phone: '',
                email: '',
                checkInDate: '',
                checkOutDate: '',
                guests: 1,
                totalPrice: '',
                deposit: '',
                address: aptData ? aptData.address : '',
                notes: '',
            });
            setFiles({ idFront: null, idBack: null });
            sigPadRef.current.clear();
            window.scrollTo(0, 0);

        } catch (err) {
            console.error(err);
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    // -----------------------------------------------------------------------
    // Render based on aptStatus
    // -----------------------------------------------------------------------
    if (aptStatus === 'loading') {
        return <LoadingScreen />;
    }

    if (aptStatus === 'no_param') {
        return (
            <ErrorCard
                icon={XCircle}
                title="Invalid Link"
                message="No apartment was specified in this link. Please use the link provided by your host."
                iconColor="text-red-500"
                bgColor="bg-red-50"
                borderColor="border-red-200"
            />
        );
    }

    if (aptStatus === 'not_found') {
        return (
            <ErrorCard
                icon={Home}
                title="Property Not Found"
                message="We couldn't find an apartment matching this link. Please contact your host."
                iconColor="text-orange-500"
                bgColor="bg-orange-50"
                borderColor="border-orange-200"
            />
        );
    }

    if (aptStatus === 'not_active') {
        return (
            <ErrorCard
                icon={AlertTriangle}
                title="Link Not Active"
                message="This rental link is currently inactive. Please contact your host for a valid link."
                iconColor="text-yellow-500"
                bgColor="bg-yellow-50"
                borderColor="border-yellow-200"
            />
        );
    }

    if (aptStatus === 'fetch_error') {
        return (
            <ErrorCard
                icon={WifiOff}
                title="Connection Error"
                message="We couldn't load apartment information. Please check your internet connection and try again."
                iconColor="text-gray-500"
                bgColor="bg-gray-100"
                borderColor="border-gray-200"
            />
        );
    }

    // -----------------------------------------------------------------------
    // Success screen
    // -----------------------------------------------------------------------
    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Submission Successful!</h2>
                    <p className="text-gray-600 mb-6">Thank you. Your rental contract has been submitted successfully.</p>
                    <button
                        onClick={() => setSuccess(false)}
                        className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition"
                    >
                        Submit Another
                    </button>
                </div>
            </div>
        );
    }

    // -----------------------------------------------------------------------
    // Main form
    // -----------------------------------------------------------------------
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">

                <header className="text-center mb-10">
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Rental Contract Form</h1>
                    {aptData?.owner_name && (
                        <p className="mt-1 text-blue-600 font-medium">Managed by {aptData.owner_name}</p>
                    )}
                    <p className="mt-2 text-gray-600">Please fill out the details below to complete your registration.</p>
                </header>

                <form ref={formRef} onSubmit={handleSubmit} className="bg-white shadow-xl rounded-2xl overflow-hidden">

                    {/* Section: Guest Information */}
                    <div className="p-8 border-b border-gray-100">
                        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                            <Users className="w-5 h-5 mr-2 text-blue-600" />
                            Guest Information
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    required
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                    placeholder="John Doe"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nationality *</label>
                                <input
                                    type="text"
                                    name="nationality"
                                    required
                                    value={formData.nationality}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    required
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                />
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ID Type</label>
                                <select
                                    name="idType"
                                    value={formData.idType}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                                >
                                    <option>National ID</option>
                                    <option>Passport</option>
                                    <option>Driver License</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ID Number *</label>
                                <input
                                    type="text"
                                    name="idNumber"
                                    required
                                    value={formData.idNumber}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section: Reservation Details */}
                    <div className="p-8 border-b border-gray-100 bg-gray-50/50">
                        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                            Reservation Details
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Date *</label>
                                <input
                                    type="date"
                                    name="checkInDate"
                                    required
                                    value={formData.checkInDate}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Date *</label>
                                <input
                                    type="date"
                                    name="checkOutDate"
                                    required
                                    value={formData.checkOutDate}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Guests</label>
                                <input
                                    type="number"
                                    name="guests"
                                    min="1"
                                    max="20"
                                    value={formData.guests}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                />
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Apartment Address
                                    <span className="ml-2 text-xs text-blue-500 font-normal">(auto-filled)</span>
                                </label>
                                <textarea
                                    name="address"
                                    rows="2"
                                    value={formData.address}
                                    readOnly
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none resize-none bg-gray-50 text-gray-600 cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section: Payment Info */}
                    <div className="p-8 border-b border-gray-100">
                        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                            <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                            Payment Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Total Price</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm font-medium">DH</span>
                                    </div>
                                    <input
                                        type="number"
                                        name="totalPrice"
                                        value={formData.totalPrice}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Deposit</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm font-medium">DH</span>
                                    </div>
                                    <input
                                        type="number"
                                        name="deposit"
                                        value={formData.deposit}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section: ID Uploads */}
                    <div className="p-8 border-b border-gray-100 bg-gray-50/50">
                        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                            <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                            Identity Documents
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FileUpload
                                label="ID Front"
                                name="idFront"
                                required
                                onChange={handleFileChange}
                            />
                            <FileUpload
                                label="ID Back"
                                name="idBack"
                                required
                                onChange={handleFileChange}
                            />
                        </div>
                    </div>

                    {/* Section: Notes & Signature */}
                    <div className="p-8">
                        <div className="mb-8">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Special Notes</label>
                            <textarea
                                name="notes"
                                rows="3"
                                value={formData.notes}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            ></textarea>
                        </div>

                        <div className="mb-8">
                            <SignaturePad
                                ref={sigPadRef}
                                label="Signature"
                                required
                            />
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start text-red-700">
                                <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 px-6 rounded-xl font-bold text-white shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0
                ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'}
              `}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Submitting...
                                </span>
                            ) : (
                                'Submit Contract'
                            )}
                        </button>
                    </div>

                </form>

                <p className="text-center text-gray-400 text-sm mt-8 mb-4">
                    &copy; {new Date().getFullYear()} Rental Agency. All rights reserved.
                </p>

            </div>
        </div>
    );
}

export default App;
