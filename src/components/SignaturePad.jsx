import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Eraser } from 'lucide-react';

const SignaturePad = forwardRef(({ label, required, error, onEnd }, ref) => {
    const sigPad = useRef({});

    // Expose clear method and check empty status to parent
    useImperativeHandle(ref, () => ({
        clear: () => sigPad.current?.clear(),
        isEmpty: () => sigPad.current?.isEmpty(),
        getTrimmedCanvas: () => sigPad.current?.getTrimmedCanvas(),
    }));

    const handleClear = () => {
        sigPad.current?.clear();
        // Notify parent that content changed (cleared)
        if (onEnd) onEnd();
    };

    return (
        <div className="mb-6">
            <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
                <button
                    type="button"
                    onClick={handleClear}
                    className="text-xs flex items-center text-gray-500 hover:text-red-600 transition-colors"
                >
                    <Eraser className="w-3 h-3 mr-1" />
                    Clear
                </button>
            </div>

            <div className={`border-2 rounded-lg overflow-hidden bg-white touch-none ${error ? 'border-red-300' : 'border-gray-300'}`}>
                <SignatureCanvas
                    ref={sigPad}
                    penColor="black"
                    backgroundColor="rgba(255,255,255,1)"
                    canvasProps={{
                        className: 'w-full h-40 signature-canvas',
                    }}
                    onEnd={onEnd}
                />
            </div>

            {error ? (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            ) : (
                <p className="mt-1 text-xs text-gray-400">Sign above using your mouse or finger</p>
            )}
        </div>
    );
});

export default SignaturePad;
